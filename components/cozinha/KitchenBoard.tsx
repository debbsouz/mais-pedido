"use client";

import { useMemo } from "react";

import { useOrders } from "@/components/providers/OrdersProvider";

import {
  KitchenCard,
  type KitchenOrder,
} from "./KitchenCard";

function getElapsedMinutes(
  createdAt?: number,
  time?: string,
) {
  if (createdAt) {
    return Math.max(
      0,
      Math.floor(
        (Date.now() - createdAt) / 1000 / 60,
      ),
    );
  }

  if (time) {
    const match = time.match(/(\d+)/);

    if (match) {
      return Number(match[1]);
    }
  }

  return 0;
}

export function KitchenBoard() {
  const { orders, moveOrder } = useOrders();

  const kitchenOrders = useMemo(() => {
    return orders
      .filter(
        (order) => order.status === "preparing",
      )
      .map<KitchenOrder>((order) => {
        const items =
          order.itemDetails?.length
            ? order.itemDetails.map((item) => ({
                id: item.productId,
                quantity: item.quantity,
                name: item.name,
              }))
            : [
                {
                  id: `${order.id}-summary`,
                  quantity: 1,
                  name: order.items,
                },
              ];

        return {
          id: order.id,
          customer: order.customer,
          origin: order.origin,
          fulfillment: order.fulfillment,
          elapsedMinutes: getElapsedMinutes(
            order.createdAt,
            order.time,
          ),
          items,
          observation:
            order.payment?.observation ||
            undefined,
        };
      });
  }, [orders]);

  function markAsReady(orderId: string) {
    moveOrder(orderId, "ready");
  }

  const delayedOrders =
    kitchenOrders.filter(
      (order) =>
        order.elapsedMinutes >= 20,
    ).length;

  const averageTime =
    kitchenOrders.length > 0
      ? Math.round(
          kitchenOrders.reduce(
            (total, order) =>
              total +
              order.elapsedMinutes,
            0,
          ) / kitchenOrders.length,
        )
      : 0;

  return (
    <section className="kitchen-board">
      <div className="kitchen-board__summary">
        <div className="kitchen-board__metrics">
          <div className="kitchen-board__metric">
            <span>Em preparo</span>
            <strong>
              {kitchenOrders.length}
            </strong>
          </div>

          <div className="kitchen-board__metric">
            <span>Atrasados</span>
            <strong>
              {delayedOrders}
            </strong>
          </div>

          <div className="kitchen-board__metric">
            <span>Tempo médio</span>
            <strong>
              {averageTime} min
            </strong>
          </div>
        </div>

        <p>
          Pedidos aparecem aqui
          automaticamente após serem
          aceitos.
        </p>
      </div>

      {kitchenOrders.length > 0 ? (
        <div className="kitchen-board__grid">
          {kitchenOrders.map((order) => (
            <KitchenCard
              key={order.id}
              order={order}
              onReady={markAsReady}
            />
          ))}
        </div>
      ) : (
        <div className="kitchen-board__empty">
          <span>✓</span>

          <h2>Produção em dia!</h2>

          <p>
            Nenhum pedido aguardando
            preparo.
          </p>
        </div>
      )}
    </section>
  );
}