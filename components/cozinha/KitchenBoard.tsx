"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useOrders } from "@/components/providers/OrdersProvider";

import {
  KitchenCard,
  type KitchenOrder,
} from "./KitchenCard";

/**
 * Extrai minutos do texto "há X min".
 *
 * Esse valor é estável e pode ser usado
 * tanto no SSR quanto na primeira
 * hidratação do client.
 */
function getElapsedFromTime(
  time?: string,
): number {
  if (!time) {
    return 0;
  }

  const match = time.match(/(\d+)/);

  return match
    ? Number(match[1])
    : 0;
}

/**
 * Calcula o tempo real usando um timestamp
 * fornecido pelo relógio do client.
 *
 * Se ainda não houver relógio disponível,
 * mantém o valor textual estável.
 */
function getElapsedMinutes(
  now: number | null,
  createdAt?: number,
  time?: string,
): number {
  if (
    now !== null &&
    createdAt
  ) {
    return Math.max(
      0,
      Math.floor(
        (now - createdAt) /
          1000 /
          60,
      ),
    );
  }

  return getElapsedFromTime(time);
}

export function KitchenBoard() {
  const { orders, moveOrder } =
    useOrders();

  /*
   * null durante SSR e primeira hidratação.
   *
   * Depois que o componente já está no
   * navegador, o relógio começa a atualizar.
   */
  const [now, setNow] =
    useState<number | null>(null);

  useEffect(() => {
    /*
     * O primeiro update acontece de forma
     * assíncrona, evitando setState direto
     * dentro do corpo do effect.
     */
    const initialTimer =
      window.setTimeout(() => {
        setNow(Date.now());
      }, 0);

    /*
     * Atualiza uma vez por minuto.
     * Não precisamos recalcular segundos
     * em uma tela operacional que exibe
     * apenas minutos.
     */
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
                      name: order.items,
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

              /*
               * Observação enviada pelo
               * garçom na nova rodada.
               *
               * Mantém a observação antiga
               * como fallback para pedidos
               * criados pelo fluxo
               * administrativo.
               */
              observation:
                order.observation ||
                undefined,
            };
          },
        );
    }, [orders, now]);

  function markAsReady(
    orderId: string,
  ) {
    moveOrder(
      orderId,
      "ready",
    );
  }

  const delayedOrders =
    kitchenOrders.filter(
      (order) =>
        order.elapsedMinutes >=
        20,
    ).length;

  const averageTime =
    kitchenOrders.length > 0
      ? Math.round(
          kitchenOrders.reduce(
            (total, order) =>
              total +
              order.elapsedMinutes,
            0,
          ) /
            kitchenOrders.length,
        )
      : 0;

  return (
    <section className="kitchen-board">
      <div className="kitchen-board__summary">
        <div className="kitchen-board__metrics">
          <div className="kitchen-board__metric">
            <span>
              Em preparo
            </span>

            <strong>
              {
                kitchenOrders.length
              }
            </strong>
          </div>

          <div className="kitchen-board__metric">
            <span>
              Atrasados
            </span>

            <strong>
              {delayedOrders}
            </strong>
          </div>

          <div className="kitchen-board__metric">
            <span>
              Tempo médio
            </span>

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

      {kitchenOrders.length >
      0 ? (
        <div className="kitchen-board__grid">
          {kitchenOrders.map(
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
            Produção em dia!
          </h2>

          <p>
            Nenhum pedido
            aguardando preparo.
          </p>
        </div>
      )}
    </section>
  );
}