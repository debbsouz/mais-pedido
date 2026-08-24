"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useOrders } from "@/components/providers/OrdersProvider";
import { getElapsedMinutes } from "@/lib/order-timing";

import {
  KitchenCard,
  type KitchenOrder,
} from "./KitchenCard";

type KitchenFilter =
  | "all"
  | "delivery"
  | "pickup"
  | "table";

const MAX_OPERATION_TIME = 180;

function normalizeValue(
  value?: string,
) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      ) ?? ""
  );
}

function getOrderFilter(
  order: KitchenOrder,
): KitchenFilter {
  const fulfillment =
    normalizeValue(
      order.fulfillment,
    );

  const origin =
    normalizeValue(
      order.origin,
    );

  if (
    fulfillment.includes(
      "delivery",
    ) ||
    fulfillment.includes(
      "entrega",
    )
  ) {
    return "delivery";
  }

  if (
    fulfillment.includes(
      "retirada",
    ) ||
    fulfillment.includes(
      "pickup",
    )
  ) {
    return "pickup";
  }

  if (
    fulfillment.includes("mesa") ||
    fulfillment.includes(
      "salao",
    ) ||
    origin.includes("mesa")
  ) {
    return "table";
  }

  return "all";
}

export function KitchenBoard() {
  const { orders, moveOrder } =
    useOrders();

  const [now, setNow] =
    useState<number | null>(null);

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<KitchenFilter>("all");

  useEffect(() => {
    const initialTimer =
      window.setTimeout(() => {
        setNow(Date.now());
      }, 0);

    const interval =
      window.setInterval(() => {
        setNow(Date.now());
      }, 60_000);

    return () => {
      window.clearTimeout(
        initialTimer,
      );

      window.clearInterval(
        interval,
      );
    };
  }, []);

  const kitchenOrders =
    useMemo(() => {
      return orders
        .filter(
          (order) =>
            order.status ===
            "preparing",
        )
        .map(
          (
            order,
          ): KitchenOrder => {
            const items =
              order.itemDetails
                ?.length
                ? order.itemDetails.map(
                    (item) => ({
                      id: item.productId,
                      quantity:
                        item.quantity,
                      name: item.name,
                    }),
                  )
                : [
                    {
                      id: `${order.id}-summary`,
                      quantity: 1,
                      name:
                        order.items,
                    },
                  ];

            return {
              id: order.id,

              customer:
                order.customer,

              origin:
                order.origin,

              fulfillment:
                order.fulfillment,

              elapsedMinutes:
                getElapsedMinutes(
                  now,
                  order.createdAt,
                  order.time,
                ),

              items,

              observation:
                order.observation ||
                undefined,
            };
          },
        )
        .sort(
          (a, b) =>
            b.elapsedMinutes -
            a.elapsedMinutes,
        );
    }, [orders, now]);

  const operationOrders =
    useMemo(
      () =>
        kitchenOrders.filter(
          (order) =>
            order.elapsedMinutes <
            MAX_OPERATION_TIME,
        ),
      [kitchenOrders],
    );

  const visibleOrders =
    useMemo(() => {
      if (
        activeFilter === "all"
      ) {
        return kitchenOrders;
      }

      return kitchenOrders.filter(
        (order) =>
          getOrderFilter(order) ===
          activeFilter,
      );
    }, [
      kitchenOrders,
      activeFilter,
    ]);

  const counts = useMemo(
    () => ({
      all: kitchenOrders.length,

      delivery:
        kitchenOrders.filter(
          (order) =>
            getOrderFilter(
              order,
            ) === "delivery",
        ).length,

      pickup:
        kitchenOrders.filter(
          (order) =>
            getOrderFilter(
              order,
            ) === "pickup",
        ).length,

      table:
        kitchenOrders.filter(
          (order) =>
            getOrderFilter(
              order,
            ) === "table",
        ).length,
    }),
    [kitchenOrders],
  );

  const delayedOrders =
    operationOrders.filter(
      (order) =>
        order.elapsedMinutes >=
        20,
    ).length;

  const averageTime =
    operationOrders.length > 0
      ? Math.round(
          operationOrders.reduce(
            (total, order) =>
              total +
              order.elapsedMinutes,
            0,
          ) /
            operationOrders.length,
        )
      : 0;

  function markAsReady(
    orderId: string,
  ) {
    moveOrder(
      orderId,
      "ready",
    );
  }

  return (
    <section className="kitchen-board">
      <div className="kitchen-board__overview">
        <div className="kitchen-board__metrics">
          <article className="kitchen-board__metric">
            <span>
              Em preparo
            </span>

            <strong>
              {
                kitchenOrders.length
              }
            </strong>

            <small>
              pedidos ativos
            </small>
          </article>

          <article className="kitchen-board__metric">
            <span>
              Atrasados
            </span>

            <strong>
              {delayedOrders}
            </strong>

            <small>
              acima de 20 min
            </small>
          </article>

          <article className="kitchen-board__metric">
            <span>
              Tempo médio
            </span>

            <strong>
              {operationOrders.length >
              0
                ? `${averageTime} min`
                : "—"}
            </strong>

            <small>
              produção atual
            </small>
          </article>
        </div>
      </div>

      <div className="kitchen-board__toolbar">
        <div>
          <strong>
            Fila de produção
          </strong>

          <span>
            Pedidos mais antigos
            aparecem primeiro.
          </span>
        </div>

        <div className="kitchen-board__filters">
          <button
            type="button"
            className={
              activeFilter ===
              "all"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setActiveFilter(
                "all",
              )
            }
          >
            Todos
            <span>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter ===
              "delivery"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setActiveFilter(
                "delivery",
              )
            }
          >
            Delivery
            <span>
              {
                counts.delivery
              }
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter ===
              "pickup"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setActiveFilter(
                "pickup",
              )
            }
          >
            Retirada
            <span>
              {counts.pickup}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter ===
              "table"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setActiveFilter(
                "table",
              )
            }
          >
            Salão
            <span>
              {counts.table}
            </span>
          </button>
        </div>
      </div>

      {visibleOrders.length >
      0 ? (
        <div className="kitchen-board__grid">
          {visibleOrders.map(
            (order) => (
              <KitchenCard
                key={order.id}
                order={order}
                onReady={
                  markAsReady
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="kitchen-board__empty">
          <span>✓</span>

          <h2>
            {kitchenOrders.length ===
            0
              ? "Produção em dia!"
              : "Nenhum pedido neste filtro"}
          </h2>

          <p>
            {kitchenOrders.length ===
            0
              ? "Nenhum pedido aguardando preparo."
              : "Selecione outro tipo de pedido para visualizar a fila."}
          </p>
        </div>
      )}
    </section>
  );
}