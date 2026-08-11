"use client";

import {
  createContext,
  type ReactNode,
  useContext,
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
