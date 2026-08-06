"use client";

import { useState } from "react";

import {
  OrderCard,
  type Order,
  type OrderStatus,
} from "./OrderCard";
import { OrderColumn } from "./OrderColumn";
import { OrderDrawer } from "./OrderDrawer";

interface OrdersBoardProps {
  activeFilter:
    | "Todos"
    | "Delivery"
    | "Retirada"
    | "Mesa"
    | "Balcão"
    | "WhatsApp";

  searchTerm: string;

  orders: Order[];

  onOrdersChange: (
    updater:
      | Order[]
      | ((currentOrders: Order[]) => Order[]),
  ) => void;

  onOrderHandled: (orderId: string) => void;
}

export const initialOrders: Order[] = [
  {
    id: "1052",
    customer: "Amanda Rocha",
    origin: "WhatsApp",
    fulfillment: "Retirada",
    time: "há 7 min",
    total: "R$ 72,90",
    items: "2 X-Burgers, 1 batata grande",
    status: "new",
    delayed: true,
  },
  {
    id: "1051",
    customer: "Mesa 04",
    origin: "Garçom",
    fulfillment: "Mesa",
    time: "há 4 min",
    total: "R$ 118,50",
    items: "1 pizza grande, 2 refrigerantes",
    status: "new",
  },
  {
    id: "1050",
    customer: "Carlos Lima",
    origin: "Site",
    fulfillment: "Delivery",
    time: "há 2 min",
    total: "R$ 46,00",
    items: "1 combo família",
    status: "new",
  },
  {
    id: "1049",
    customer: "Mesa 08",
    origin: "Garçom",
    fulfillment: "Mesa",
    time: "há 12 min",
    total: "R$ 96,50",
    items: "2 hambúrgueres, 1 porção",
    status: "preparing",
  },
  {
    id: "1048",
    customer: "Mariana Alves",
    origin: "Site",
    fulfillment: "Delivery",
    time: "há 15 min",
    total: "R$ 58,90",
    items: "1 X-Salada, 1 refrigerante",
    status: "preparing",
  },
  {
    id: "1047",
    customer: "João Pedro",
    origin: "Atendente",
    fulfillment: "Balcão",
    time: "há 18 min",
    total: "R$ 38,00",
    items: "1 cachorro-quente, 1 suco",
    status: "preparing",
  },
  {
    id: "1046",
    customer: "Fernanda Souza",
    origin: "WhatsApp",
    fulfillment: "Retirada",
    time: "pronto há 3 min",
    total: "R$ 64,00",
    items: "2 combos tradicionais",
    status: "ready",
  },
  {
    id: "1045",
    customer: "Mesa 12",
    origin: "Garçom",
    fulfillment: "Mesa",
    time: "pronto há 5 min",
    total: "R$ 132,90",
    items: "1 pizza família, bebidas",
    status: "ready",
  },
  {
    id: "1044",
    customer: "Rafael Martins",
    origin: "Site",
    fulfillment: "Delivery",
    time: "saiu há 8 min",
    total: "R$ 84,50",
    items: "2 hambúrgueres especiais",
    status: "delivery",
  },
  {
    id: "1043",
    customer: "Patrícia Lopes",
    origin: "WhatsApp",
    fulfillment: "Delivery",
    time: "aguardando entregador",
    total: "R$ 52,00",
    items: "1 combo individual",
    status: "delivery",
  },
];

const statusSequence: Record<
  OrderStatus,
  OrderStatus | null
> = {
  new: "preparing",
  preparing: "ready",
  ready: "delivery",
  delivery: null,
};

export function OrdersBoard({
  activeFilter,
  searchTerm,
  orders,
  onOrdersChange,
  onOrderHandled,
}: OrdersBoardProps) {
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  function moveOrder(
    orderId: string,
    newStatus: OrderStatus,
  ) {
    onOrdersChange((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              delayed: false,
            }
          : order,
      ),
    );
  }

  function acceptOrder(orderId: string) {
    moveOrder(orderId, "preparing");
    onOrderHandled(orderId);
  }

  function rejectOrder(orderId: string) {
    const shouldReject = window.confirm(
      "Tem certeza de que deseja recusar este pedido?",
    );

    if (!shouldReject) {
      return;
    }

    onOrdersChange((currentOrders) =>
      currentOrders.filter(
        (order) => order.id !== orderId,
      ),
    );

    onOrderHandled(orderId);

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  }

  function advanceOrder(orderId: string) {
    onOrdersChange((currentOrders) =>
      currentOrders.flatMap((order) => {
        if (order.id !== orderId) {
          return [order];
        }

        if (
          order.status === "ready" &&
          order.fulfillment !== "Delivery"
        ) {
          return [];
        }

        const nextStatus =
          statusSequence[order.status];

        if (!nextStatus) {
          return [];
        }

        return [
          {
            ...order,
            status: nextStatus,
          },
        ];
      }),
    );

    setSelectedOrder(null);
  }

  function matchesActiveFilter(order: Order) {
    if (activeFilter === "Todos") {
      return true;
    }

    if (activeFilter === "WhatsApp") {
      return order.origin === "WhatsApp";
    }

    return order.fulfillment === activeFilter;
  }

  function matchesSearch(order: Order) {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return [
      order.id,
      order.customer,
      order.items,
      order.origin,
      order.fulfillment,
    ].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );
  }

  function ordersByStatus(status: OrderStatus) {
    return orders.filter(
      (order) =>
        order.status === status &&
        matchesActiveFilter(order) &&
        matchesSearch(order),
    );
  }

  function renderCards(status: OrderStatus) {
    return ordersByStatus(status).map((order) => (
      <OrderCard
        key={order.id}
        order={order}
        onAccept={acceptOrder}
        onReject={rejectOrder}
        onAdvance={advanceOrder}
        onOpen={setSelectedOrder}
      />
    ));
  }

  const newOrders = ordersByStatus("new");
  const preparingOrders =
    ordersByStatus("preparing");
  const readyOrders = ordersByStatus("ready");
  const deliveryOrders =
    ordersByStatus("delivery");

  return (
    <>
      <section className="orders-board">
        <OrderColumn
          title="Novos pedidos"
          count={newOrders.length}
          variant="waiting"
        >
          {renderCards("new")}
        </OrderColumn>

        <OrderColumn
          title="Em preparo"
          count={preparingOrders.length}
          variant="preparing"
        >
          {renderCards("preparing")}
        </OrderColumn>

        <OrderColumn
          title="Prontos"
          count={readyOrders.length}
          variant="ready"
        >
          {renderCards("ready")}
        </OrderColumn>

        <OrderColumn
          title="Em entrega"
          count={deliveryOrders.length}
          variant="delivery"
        >
          {renderCards("delivery")}
        </OrderColumn>
      </section>

      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}