"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  useOrders,
} from "@/components/providers/OrdersProvider";
import type { OrderStatus } from "@/components/pedidos/OrderCard";
import { formatOrderNumber } from "@/lib/format";

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "accepted":
      return {
        label: "Aceito",
        className: "status--accepted",
      };

    case "preparing":
      return {
        label: "Em preparo",
        className: "status--preparing",
      };

    case "ready":
      return {
        label: "Pronto",
        className: "status--ready",
      };

    case "delivery":
      return {
        label: "Em entrega",
        className: "status--ready",
      };

    case "completed":
      return {
        label: "Finalizado",
        className: "status--completed",
      };

    case "cancelled":
      return {
        label: "Cancelado",
        className: "status--cancelled",
      };

    default:
      return {
        label: "Aguardando",
        className: "status--waiting",
      };
  }
}

export function RecentOrders() {
  const router = useRouter();
  const { orders } = useOrders();

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          (b.createdAt ?? 0) -
          (a.createdAt ?? 0),
      )
      .slice(0, 3);
  }, [orders]);

  return (
    <article className="dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <h2>Últimos pedidos</h2>
          <p>Movimentação recente</p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/pedidos")}
        >
          Ver todos
        </button>
      </div>

      {recentOrders.length > 0 ? (
        <div className="recent-orders">
          {recentOrders.map((order) => {
            const badge = getStatusBadge(
              order.status,
            );

            return (
              <div key={order.id}>
                <div>
                  <strong>
                    {formatOrderNumber(
                      order.number,
                    )}{" "}
                    · {order.customer}
                  </strong>

                  <span>
                    {order.origin} ·{" "}
                    {order.time}
                  </span>
                </div>

                <span
                  className={`status ${badge.className}`}
                >
                  {badge.label}
                </span>

                <b>{order.total}</b>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="recent-orders__empty">
          Nenhum pedido registrado ainda.
        </p>
      )}
    </article>
  );
}
