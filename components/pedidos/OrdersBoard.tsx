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

  onMoveOrder: (
    orderId: string,
    status: OrderStatus,
  ) => Promise<void>;

  onCompleteOrder: (
    orderId: string,
  ) => Promise<void>;

  onCancelOrder: (
    orderId: string,
  ) => Promise<void>;

  onOrderHandled: (
    orderId: string,
  ) => void;
}

const statusSequence: Record<
  OrderStatus,
  OrderStatus | null
> = {
  new: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "delivery",
  delivery: null,
  completed: null,
  cancelled: null,
};

const mobileStatusLabels: Record<
  OrderStatus,
  string
> = {
  new: "Novos",
  accepted: "Aceitos",
  preparing: "Preparo",
  ready: "Prontos",
  delivery: "Entrega",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

function getColumnVariant(
  status: OrderStatus,
):
  | "waiting"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivery"
  | "completed"
  | "cancelled" {
  if (status === "new" || status === "accepted") {
    return status === "new" ? "waiting" : "accepted";
  }

  if (status === "completed" || status === "cancelled") {
    return status;
  }

  return status as any;
}

export function OrdersBoard({
  activeFilter,
  searchTerm,
  orders,
  onMoveOrder,
  onCompleteOrder,
  onCancelOrder,
  onOrderHandled,
}: OrdersBoardProps) {
  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<Order | null>(null);

  const [
    mobileStatus,
    setMobileStatus,
  ] = useState<OrderStatus>("new");

  async function handleAcceptOrder(
    orderId: string,
  ) {
    await onMoveOrder(
      orderId,
      "accepted",
    );

    onOrderHandled(orderId);
  }

  async function handleRejectOrder(
    orderId: string,
  ) {
    const shouldReject =
      window.confirm(
        "Tem certeza de que deseja recusar este pedido?",
      );

    if (!shouldReject) {
      return;
    }

    await onCancelOrder(orderId);

    onOrderHandled(orderId);

    if (
      selectedOrder?.id ===
      orderId
    ) {
      setSelectedOrder(null);
    }
  }

  async function handleAdvanceOrder(
    orderId: string,
  ) {
    const order = orders.find(
      (o) => o.id === orderId,
    );

    if (!order) {
      return;
    }

    // Regra especial: ready + não-Delivery → finalizar (concluído)
    if (
      order.status === "ready" &&
      order.fulfillment !==
        "Delivery"
    ) {
      await onCompleteOrder(orderId);
      setSelectedOrder(null);
      return;
    }

    // Em entrega → "Finalizar entrega" conclui o pedido.
    if (order.status === "delivery") {
      await onCompleteOrder(orderId);
      setSelectedOrder(null);
      return;
    }

    const nextStatus =
      statusSequence[order.status];

    if (nextStatus) {
      await onMoveOrder(
        orderId,
        nextStatus,
      );
    }

    setSelectedOrder(null);
  }

  function matchesActiveFilter(
    order: Order,
  ) {
    if (
      activeFilter === "Todos"
    ) {
      return true;
    }

    if (
      activeFilter ===
      "WhatsApp"
    ) {
      return (
        order.origin ===
        "WhatsApp"
      );
    }

    return (
      order.fulfillment ===
      activeFilter
    );
  }

  function matchesSearch(
    order: Order,
  ) {
    const normalizedSearch =
      searchTerm
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
      value
        .toLowerCase()
        .includes(
          normalizedSearch,
        ),
    );
  }

  function ordersByStatus(
    status: OrderStatus,
  ) {
    return orders.filter(
      (order) =>
        order.status === status &&
        matchesActiveFilter(order) &&
        matchesSearch(order),
    );
  }

  function renderCards(
    status: OrderStatus,
  ) {
    return ordersByStatus(
      status,
    ).map((order) => (
      <OrderCard
        key={order.id}
        order={order}
        onOpen={() =>
          setSelectedOrder(
            order,
          )
        }
        onAccept={
          handleAcceptOrder
        }
        onReject={
          handleRejectOrder
        }
        onAdvance={
          handleAdvanceOrder
        }
      />
    ));
  }

  const newOrders =
    ordersByStatus("new");

  const acceptedOrders =
    ordersByStatus("accepted");

  const preparingOrders =
    ordersByStatus(
      "preparing",
    );

  const readyOrders =
    ordersByStatus("ready");

  const deliveryOrders =
    ordersByStatus(
      "delivery",
    );

  const statusCounts: Record<
    OrderStatus,
    number
  > = {
    new: newOrders.length,
    accepted: acceptedOrders.length,
    preparing:
      preparingOrders.length,
    ready: readyOrders.length,
    delivery:
      deliveryOrders.length,
    completed: 0,
    cancelled: 0,
  };

  const mobileStatuses: OrderStatus[] =
    [
      "new",
      "accepted",
      "preparing",
      "ready",
      "delivery",
    ];

  return (
    <>
      {/* MOBILE */}

      <div className="orders-mobile-status">
        {mobileStatuses.map(
          (status) => (
            <button
              key={status}
              type="button"
              className={
                mobileStatus ===
                status
                  ? "orders-mobile-status__button orders-mobile-status__button--active"
                  : "orders-mobile-status__button"
              }
              onClick={() =>
                setMobileStatus(
                  status,
                )
              }
            >
              <span>
                {
                  mobileStatusLabels[
                    status
                  ]
                }
              </span>

              <strong>
                {
                  statusCounts[
                    status
                  ]
                }
              </strong>
            </button>
          ),
        )}
      </div>

      <section className="orders-mobile-board">
        <OrderColumn
          title={
            mobileStatus ===
            "new"
              ? "Novos pedidos"
              : mobileStatus ===
                  "accepted"
                ? "Pedidos aceitos"
                : mobileStatus ===
                    "preparing"
                  ? "Em preparo"
                  : mobileStatus ===
                      "ready"
                    ? "Prontos"
                    : "Em entrega"
          }
          count={
            statusCounts[
              mobileStatus
            ]
          }
          variant={getColumnVariant(
            mobileStatus,
          )}
        >
          {renderCards(
            mobileStatus,
          )}
        </OrderColumn>
      </section>

      {/* DESKTOP */}

      <section className="orders-board orders-board--desktop">
        <OrderColumn
          title="Novos pedidos"
          count={
            newOrders.length
          }
          variant="waiting"
        >
          {renderCards("new")}
        </OrderColumn>

        <OrderColumn
          title="Aceitos"
          count={
            acceptedOrders.length
          }
          variant="accepted"
        >
          {renderCards(
            "accepted",
          )}
        </OrderColumn>

        <OrderColumn
          title="Em preparo"
          count={
            preparingOrders.length
          }
          variant="preparing"
        >
          {renderCards(
            "preparing",
          )}
        </OrderColumn>

        <OrderColumn
          title="Prontos"
          count={
            readyOrders.length
          }
          variant="ready"
        >
          {renderCards(
            "ready",
          )}
        </OrderColumn>

        <OrderColumn
          title="Em entrega"
          count={
            deliveryOrders.length
          }
          variant="delivery"
        >
          {renderCards(
            "delivery",
          )}
        </OrderColumn>
      </section>

      <OrderDrawer
        order={selectedOrder}
        onClose={() =>
          setSelectedOrder(null)
        }
      />
    </>
  );
}