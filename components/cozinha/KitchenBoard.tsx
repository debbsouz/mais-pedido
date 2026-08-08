"use client";

import { useState } from "react";

import {
  KitchenCard,
  type KitchenOrder,
} from "./KitchenCard";

const initialKitchenOrders: KitchenOrder[] = [
  {
    id: "1049",
    customer: "Mesa 08",
    origin: "Garçom",
    fulfillment: "Mesa",
    elapsedMinutes: 7,
    items: [
      {
        id: "1",
        quantity: 2,
        name: "X-Burger",
      },
      {
        id: "2",
        quantity: 1,
        name: "Batata grande",
        observation: "Sem sal",
      },
    ],
  },

  {
    id: "1048",
    customer: "Mariana Alves",
    origin: "Site",
    fulfillment: "Delivery",
    elapsedMinutes: 13,
    items: [
      {
        id: "1",
        quantity: 1,
        name: "X-Salada",
        observation: "Sem cebola",
      },
      {
        id: "2",
        quantity: 1,
        name: "Coca-Cola 2L",
      },
    ],
    observation:
      "Enviar os molhos separados.",
  },

  {
    id: "1047",
    customer: "João Pedro",
    origin: "Atendente",
    fulfillment: "Balcão",
    elapsedMinutes: 23,
    items: [
      {
        id: "1",
        quantity: 2,
        name: "Cachorro-quente completo",
      },
      {
        id: "2",
        quantity: 1,
        name: "Suco de laranja",
      },
    ],
    observation:
      "Cliente aguardando no balcão.",
  },
];

export function KitchenBoard() {
  const [orders, setOrders] =
    useState<KitchenOrder[]>(
      initialKitchenOrders,
    );

  function markAsReady(orderId: string) {
    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) => order.id !== orderId,
      ),
    );
  }

  return (
    <section className="kitchen-board">
      <div className="kitchen-board__summary">
        <div>
          <span>Em preparo</span>
          <strong>{orders.length}</strong>
        </div>

        <p>
          Pedidos aparecem aqui após serem
          aceitos.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="kitchen-board__grid">
          {orders.map((order) => (
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
            Nenhum pedido aguardando preparo.
          </p>
        </div>
      )}
    </section>
  );
}