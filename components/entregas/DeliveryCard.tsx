"use client";

import {
  Check,
  Clock,
  MapPin,
  Motorcycle,
  Phone,
  Receipt,
  Warning,
} from "@phosphor-icons/react";

import type { Order } from "@/components/pedidos/OrderCard";
import { getShortOrderCode } from "@/lib/format";
import type { OrderUrgency } from "@/lib/order-timing";

interface DeliveryCardProps {
  order: Order;
  urgency: OrderUrgency;
  onComplete: (orderId: string) => void;
}

function getAddress(order: Order) {
  if (!order.address) {
    return "Endereço não informado";
  }

  const {
    street,
    number,
    complement,
    neighborhood,
    city,
  } = order.address;

  return [
    `${street}, ${number}`,
    complement,
    neighborhood,
    city,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getPayment(order: Order) {
  if (!order.payment) {
    return "Pagamento não informado";
  }

  const { method, cardBrand } = order.payment;

  if (
    method === "Crédito" ||
    method === "Débito"
  ) {
    return `${method} · ${
      cardBrand ?? "Bandeira não informada"
    }`;
  }

  return method;
}

export function DeliveryCard({
  order,
  urgency,
  onComplete,
}: DeliveryCardProps) {
  return (
    <article
      className={`delivery-card delivery-card--${urgency}`}
    >
      <header className="delivery-card__header">
        <div>
          <span>Pedido {getShortOrderCode(order.id)}</span>

          <h2>{order.customer}</h2>
        </div>

        <div className="delivery-card__status">
          <Motorcycle
            size={17}
            weight="fill"
          />

          Em entrega
        </div>
      </header>

      <div className="delivery-card__info">
        <div>
          <MapPin size={18} />

          <div>
            <span>Endereço</span>
            <strong>
              {getAddress(order)}
            </strong>
          </div>
        </div>

        {order.phone && (
          <div>
            <Phone size={18} />

            <div>
              <span>Telefone</span>
              <strong>
                {order.phone}
              </strong>
            </div>
          </div>
        )}

        <div>
          <Receipt size={18} />

          <div>
            <span>Pagamento</span>
            <strong>
              {getPayment(order)}
            </strong>
          </div>
        </div>

        {order.payment?.needsCardMachine && (
          <div>
            <Receipt size={18} />

            <div>
              <span>Maquininha</span>
              <strong>
                Levar na entrega
              </strong>
            </div>
          </div>
        )}

        {order.payment?.changeFor && (
          <div>
            <Receipt size={18} />

            <div>
              <span>Troco para</span>
              <strong>
                R$ {order.payment.changeFor}
              </strong>
            </div>
          </div>
        )}
      </div>

      <section className="delivery-card__order">
        <div className="delivery-card__order-title">
          <span>Pedido</span>
          <strong>{order.total}</strong>
        </div>

        <p>{order.items}</p>
      </section>

      <div
        className={`delivery-card__time delivery-card__time--${urgency}`}
      >
        {urgency === "critical" ? (
          <Warning size={16} weight="fill" />
        ) : (
          <Clock size={16} />
        )}
        <span>{order.time}</span>
      </div>

      <button
        type="button"
        className="delivery-card__complete"
        onClick={() =>
          onComplete(order.id)
        }
      >
        <Check size={19} weight="bold" />
        Marcar como entregue
      </button>
    </article>
  );
}