"use client";

import { useOrders } from "@/components/providers/OrdersProvider";

import { DeliveryCard } from "./DeliveryCard";

export function DeliveryBoard() {
  const {
    orders,
    removeOrder,
  } = useOrders();

  const deliveryOrders = orders.filter(
    (order) =>
      order.status === "delivery" &&
      order.fulfillment === "Delivery",
  );

  function completeDelivery(
    orderId: string,
  ) {
    removeOrder(orderId);
  }

  return (
    <section className="delivery-board">
      <div className="delivery-board__summary">
        <div>
          <span>Em entrega</span>

          <strong>
            {deliveryOrders.length}
          </strong>
        </div>

        <p>
          Pedidos aparecem aqui quando saem
          para entrega.
        </p>
      </div>

      {deliveryOrders.length > 0 ? (
        <div className="delivery-board__grid">
          {deliveryOrders.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onComplete={
                completeDelivery
              }
            />
          ))}
        </div>
      ) : (
        <div className="delivery-board__empty">
          <span>✓</span>

          <h2>Nenhuma entrega pendente</h2>

          <p>
            Os pedidos enviados para entrega
            aparecerão aqui.
          </p>
        </div>
      )}
    </section>
  );
}