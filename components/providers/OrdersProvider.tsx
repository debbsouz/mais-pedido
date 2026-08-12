"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  Order,
  OrderStatus,
} from "@/components/pedidos/OrderCard";

import {
  createOrder as createOrderAction,
  updateOrderStatus as updateOrderStatusAction,
  deleteOrder as deleteOrderAction,
  type CreateOrderInput,
} from "@/app/actions/orders";

import { createClient } from "@/lib/supabase/client";

interface OrdersContextValue {
  orders: Order[];

  setOrders: React.Dispatch<
    React.SetStateAction<Order[]>
  >;

  moveOrder: (
    orderId: string,
    status: OrderStatus,
  ) => Promise<void>;

  addOrder: (
    order: Order,
  ) => Promise<string | null>;

  removeOrder: (
    orderId: string,
  ) => Promise<void>;
}

const OrdersContext =
  createContext<OrdersContextValue | null>(null);

/**
 * Converte um Order do frontend em CreateOrderInput
 * para enviar ao server action.
 *
 * Conversao de cents → decimal: item.price (decimal) → priceCents.
 */
function toCreateOrderInput(
  order: Order,
): CreateOrderInput {
  return {
    customerName: order.customer,
    customerPhone: order.phone,
    origin: order.origin,
    fulfillment: order.fulfillment,
    tableNumber: order.tableNumber,
    pickupName: order.pickupName,
    observation:
      order.observation ||
      order.payment?.observation ||
      undefined,
    address: order.address,
    payment: order.payment
      ? {
          method: order.payment.method,
          cardBrand: order.payment.cardBrand,
          needsCardMachine:
            order.payment.needsCardMachine,
          changeFor: order.payment.changeFor,
          observation: order.payment.observation,
        }
      : undefined,
    items: (order.itemDetails ?? []).map(
      (item) => ({
        productId: item.productId,
        name: item.name,
        priceCents: Math.round(
          item.price * 100,
        ),
        quantity: item.quantity,
      }),
    ),
  };
}

export function OrdersProvider({
  children,
  initialOrders,
}: {
  children: ReactNode;
  initialOrders?: Order[];
}) {
  const [orders, setOrders] =
    useState<Order[]>(
      initialOrders ?? [],
    );

  async function moveOrder(
    orderId: string,
    status: OrderStatus,
  ): Promise<void> {
    const result =
      await updateOrderStatusAction(
        orderId,
        status,
      );

    if (!result.success) {
      window.alert(result.error);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              delayed: false,
            }
          : order,
      ),
    );
  }

  async function addOrder(
    order: Order,
  ): Promise<string | null> {
    const input =
      toCreateOrderInput(order);

    const result =
      await createOrderAction(input);

    if (!result.success) {
      window.alert(result.error);
      return null;
    }

    const realId =
      result.data?.id ?? order.id;

    setOrders((currentOrders) => {
      const alreadyExists =
        currentOrders.some(
          (currentOrder) =>
            currentOrder.id === realId,
        );

      if (alreadyExists) {
        return currentOrders;
      }

      return [
        { ...order, id: realId },
        ...currentOrders,
      ];
    });

    return realId;
  }

  async function removeOrder(
    orderId: string,
  ): Promise<void> {
    const result =
      await deleteOrderAction(orderId);

    if (!result.success) {
      window.alert(result.error);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) =>
          order.id !== orderId,
      ),
    );
  }

  /**
   * Refaz o mapeamento de uma linha do banco (vinda do Realtime)
   * para o formato Order do frontend. Usado para INSERT/UPDATE.
   */
  function mapRealtimeRow(
    row: Record<string, unknown>,
  ): Order {
    const items =
      (row.item_details as
        | Array<{
            productId: string;
            name: string;
            price: number;
            quantity: number;
          }>
        | null) ?? [];

    const itemsSummary = items
      .map(
        (item) =>
          `${item.quantity}x ${item.name}`,
      )
      .join(", ");

    const totalCents =
      (row.total_cents as number) ?? 0;

    const createdAt = row.created_at
      ? new Date(
          row.created_at as string,
        ).getTime()
      : Date.now();

    const diffMin = Math.floor(
      (Date.now() - createdAt) / 60000,
    );

    const time =
      diffMin < 1
        ? "agora"
        : diffMin < 60
          ? `há ${diffMin} min`
          : `há ${Math.floor(diffMin / 60)}h`;

    return {
      id: row.id as string,
      customer:
        (row.customer_name as string) ||
        "Cliente",
      origin: row.origin as Order["origin"],
      fulfillment:
        row.fulfillment as Order["fulfillment"],
      status:
        row.status as Order["status"],
      time,
      total: new Intl.NumberFormat(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL",
        },
      ).format(totalCents / 100),
      items:
        itemsSummary || "Sem itens",
      createdAt,
      tableNumber:
        (row.table_number as string) ??
        undefined,
      pickupName:
        (row.pickup_name as string) ??
        undefined,
      phone:
        (row.customer_phone as string) ??
        undefined,
      observation:
        (row.observation as string) ??
        undefined,
      address:
        (row.address as Order["address"]) ??
        undefined,
      payment:
        (row.payment as Order["payment"]) ??
        undefined,
      itemDetails: items,
    };
  }

  /**
   * Real-time: subscreve a mudanças na tabela orders.
   * INSERT/UPDATE → refaz o mapeamento e atualiza o estado.
   * DELETE → remove pelo id.
   */
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newOrder =
            mapRealtimeRow(
              payload.new as Record<
                string,
                unknown
              >,
            );

          setOrders((current) => {
            if (
              current.some(
                (o) =>
                  o.id === newOrder.id,
              )
            ) {
              return current;
            }

            return [
              newOrder,
              ...current,
            ];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const updated =
            mapRealtimeRow(
              payload.new as Record<
                string,
                unknown
              >,
            );

          setOrders((current) =>
            current.map((o) =>
              o.id === updated.id
                ? updated
                : o,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const deletedId =
            (
              payload.old as Record<
                string,
                unknown
              >
            )?.id as string;

          if (deletedId) {
            setOrders((current) =>
              current.filter(
                (o) =>
                  o.id !== deletedId,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(
        channel,
      );
    };
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        setOrders,
        moveOrder,
        addOrder,
        removeOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context =
    useContext(OrdersContext);

  if (!context) {
    throw new Error(
      "useOrders deve ser usado dentro de OrdersProvider.",
    );
  }

  return context;
}
