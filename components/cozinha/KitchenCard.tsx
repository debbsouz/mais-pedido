"use client";

import {
  Check,
  Clock,
  Receipt,
  Warning,
} from "@phosphor-icons/react";

export interface KitchenItem {
  id: string;
  quantity: number;
  name: string;
  observation?: string;
}

export interface KitchenOrder {
  id: string;
  customer: string;
  origin: string;
  fulfillment: string;
  elapsedMinutes: number;
  items: KitchenItem[];
  observation?: string;
}

interface KitchenCardProps {
  order: KitchenOrder;
  onReady: (orderId: string) => void;
}

function getUrgency(
  minutes: number,
): "normal" | "warning" | "critical" {
  if (minutes >= 20) {
    return "critical";
  }

  if (minutes >= 10) {
    return "warning";
  }

  return "normal";
}

export function KitchenCard({
  order,
  onReady,
}: KitchenCardProps) {
  const urgency = getUrgency(
    order.elapsedMinutes,
  );

  return (
    <article
      className={`kitchen-card kitchen-card--${urgency}`}
    >
      <header className="kitchen-card__header">
        <div>
          <span className="kitchen-card__id">
            Pedido #{order.id}
          </span>

          <h2>{order.customer}</h2>
        </div>

        <div
          className={`kitchen-card__timer kitchen-card__timer--${urgency}`}
        >
          {urgency === "critical" ? (
            <Warning size={17} weight="fill" />
          ) : (
            <Clock size={17} weight="bold" />
          )}

          {order.elapsedMinutes} min
        </div>
      </header>

      <div className="kitchen-card__meta">
        <span>{order.fulfillment}</span>
        <span>•</span>
        <span>{order.origin}</span>
      </div>

      <div className="kitchen-card__items">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="kitchen-card__item"
          >
            <div>
              <strong>
                {item.quantity}x
              </strong>

              <span>{item.name}</span>
            </div>

            {item.observation && (
              <p>
                <Warning
                  size={14}
                  weight="fill"
                />

                {item.observation}
              </p>
            )}
          </div>
        ))}
      </div>

      {order.observation && (
        <div className="kitchen-card__observation">
          <Receipt size={18} weight="bold" />

          <div>
            <span>Observação do pedido</span>
            <strong>
              {order.observation}
            </strong>
          </div>
        </div>
      )}

      <button
        type="button"
        className="kitchen-card__ready"
        onClick={() => onReady(order.id)}
      >
        <Check size={20} weight="bold" />
        Marcar como pronto
      </button>
    </article>
  );
}