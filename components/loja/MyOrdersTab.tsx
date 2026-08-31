"use client";

import { ClipboardText } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import {
  getPublicOrderStatus,
  type PublicOrderStatus,
} from "@/app/actions/public-orders";
import { getStoredOrderIds } from "@/lib/storefront/order-history";
import type {
  OrderFulfillment,
  OrderStatusStep,
} from "@/lib/storefront/types";

import { OrderTracker } from "./OrderTracker";

interface MyOrdersTabProps {
  organizationId: string;
}

const fulfillmentFromDb: Record<string, OrderFulfillment> = {
  Delivery: "delivery",
  Retirada: "pickup",
  Mesa: "dine-in",
  Balcão: "pickup",
};

function mapStatusToStep(
  status: string,
  fulfillment: OrderFulfillment,
): OrderStatusStep | undefined {
  if (status === "new") return "received";
  if (status === "accepted") return "accepted";
  if (status === "preparing") return "preparing";

  if (status === "ready") {
    return fulfillment === "delivery" ? "preparing" : "ready";
  }

  if (status === "delivery") return "out-for-delivery";

  return undefined;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Aba "Pedidos" da loja pública. Lê os ids salvos no navegador
 * (sem login de cliente) e busca o status atualizado de cada um.
 */
export function MyOrdersTab({
  organizationId,
}: MyOrdersTabProps) {
  const [ids] = useState(() =>
    getStoredOrderIds(organizationId),
  );

  const [orders, setOrders] = useState<
    PublicOrderStatus[] | null
  >(ids.length === 0 ? [] : null);

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }

    let cancelled = false;

    void Promise.all(
      ids.map((id) => getPublicOrderStatus(id)),
    ).then((results) => {
      if (cancelled) {
        return;
      }

      setOrders(
        results.filter(
          (order): order is PublicOrderStatus =>
            order !== null,
        ),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (orders === null) {
    return null;
  }

  if (orders.length === 0) {
    return (
      <div className="storefront__empty-tab">
        <ClipboardText
          size={34}
          weight="light"
        />
        <strong>Seus pedidos</strong>
        <p>
          Assim que você fizer um pedido, o
          acompanhamento aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="storefront__my-orders">
      {orders.map((order) => {
        const fulfillment =
          fulfillmentFromDb[order.fulfillment] ??
          "pickup";

        const isTerminal =
          order.status === "completed" ||
          order.status === "cancelled";

        return (
          <div
            key={order.id}
            className="storefront__my-order"
          >
            <div className="storefront__my-order-header">
              <strong>
                Pedido #
                {String(order.number).padStart(3, "0")}
              </strong>
              <span>
                {formatPrice(order.totalCents)}
              </span>
            </div>

            {isTerminal ? (
              <p className="storefront__my-order-terminal">
                {order.status === "completed"
                  ? "Pedido concluído."
                  : "Pedido cancelado."}
              </p>
            ) : (
              <OrderTracker
                fulfillment={fulfillment}
                currentStep={mapStatusToStep(
                  order.status,
                  fulfillment,
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
