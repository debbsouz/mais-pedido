"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { assignDeliveryDriver } from "@/app/actions/orders";
import { getTeamMembers } from "@/app/actions/team";
import { useOrders } from "@/components/providers/OrdersProvider";
import {
  formatDuration,
  getElapsedMinutes,
  getOrderUrgency,
} from "@/lib/order-timing";

import { DeliveryCard } from "./DeliveryCard";

export function DeliveryBoard() {
  const {
    orders,
    setOrders,
    completeOrder,
  } = useOrders();

  const [now, setNow] =
    useState<number | null>(null);

  const [drivers, setDrivers] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    void getTeamMembers().then((members) => {
      setDrivers(
        members
          .filter((member) => member.role === "delivery")
          .map((member) => ({
            id: member.userId,
            name: member.name,
          })),
      );
    });
  }, []);

  async function assignDriver(
    orderId: string,
    driverId: string | null,
  ) {
    const driverName =
      drivers.find((driver) => driver.id === driverId)
        ?.name ?? null;

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              assignedDriverId: driverId,
              assignedDriverName: driverName,
            }
          : order,
      ),
    );

    await assignDeliveryDriver(orderId, driverId);
  }

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

  const deliveryOrders = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order.status === "delivery" &&
          order.fulfillment === "Delivery",
      )
      .map((order) => ({
        order,
        elapsedMinutes:
          getElapsedMinutes(
            now,
            order.createdAt,
            order.time,
          ),
      }))
      .sort(
        (a, b) =>
          b.elapsedMinutes -
          a.elapsedMinutes,
      );
  }, [orders, now]);

  const delayedCount =
    deliveryOrders.filter(
      (entry) =>
        entry.elapsedMinutes >= 20,
    ).length;

  const averageTime =
    deliveryOrders.length > 0
      ? Math.round(
          deliveryOrders.reduce(
            (total, entry) =>
              total +
              entry.elapsedMinutes,
            0,
          ) /
            deliveryOrders.length,
        )
      : 0;

  function completeDelivery(
    orderId: string,
  ) {
    void completeOrder(orderId);
  }

  return (
    <section className="delivery-board">
      <div className="delivery-board__metrics">
        <article className="delivery-board__metric">
          <span>Em rota</span>

          <strong>
            {deliveryOrders.length}
          </strong>

          <small>
            pedidos em entrega
          </small>
        </article>

        <article className="delivery-board__metric">
          <span>Atrasadas</span>

          <strong>
            {delayedCount}
          </strong>

          <small>
            acima de 20 min
          </small>
        </article>

        <article className="delivery-board__metric">
          <span>Tempo médio</span>

          <strong>
            {deliveryOrders.length > 0
              ? formatDuration(averageTime)
              : "—"}
          </strong>

          <small>em rota</small>
        </article>
      </div>

      {deliveryOrders.length > 0 ? (
        <>
          <div className="delivery-board__toolbar">
            <strong>
              Pedidos em rota
            </strong>

            <span>
              Pedidos mais antigos
              aparecem primeiro.
            </span>
          </div>

          <div className="delivery-board__grid">
            {deliveryOrders.map(
              ({
                order,
                elapsedMinutes,
              }) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  urgency={getOrderUrgency(
                    elapsedMinutes,
                  )}
                  drivers={drivers}
                  onAssignDriver={
                    assignDriver
                  }
                  onComplete={
                    completeDelivery
                  }
                />
              ),
            )}
          </div>
        </>
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
