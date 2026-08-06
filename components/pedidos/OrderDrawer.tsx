"use client";

import {
  CreditCard,
  MapPin,
  Phone,
  Printer,
  Receipt,
  Storefront,
  User,
  X,
} from "@phosphor-icons/react";

import type { Order } from "./OrderCard";

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getPaymentLabel(order: Order) {
  if (!order.payment) {
    return "Não informado";
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

function getAddressLabel(order: Order) {
  if (!order.address) {
    return null;
  }

  const {
    street,
    number,
    complement,
    neighborhood,
    city,
    zipCode,
  } = order.address;

  return [
    `${street}, ${number}`,
    complement,
    neighborhood,
    city,
    zipCode ? `CEP ${zipCode}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export function OrderDrawer({
  order,
  onClose,
}: OrderDrawerProps) {
  if (!order) {
    return null;
  }

  const addressLabel = getAddressLabel(order);

  return (
    <div className="order-drawer">
      <button
        type="button"
        className="order-drawer__backdrop"
        aria-label="Fechar detalhes do pedido"
        onClick={onClose}
      />

      <aside className="order-drawer__panel">
        <div className="order-drawer__header">
          <div>
            <span>Pedido #{order.id}</span>
            <h2>{order.customer}</h2>
          </div>

          <button
            type="button"
            className="order-drawer__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="order-drawer__content">
          <section className="order-drawer__section">
            <h3>Resumo</h3>

            <div className="order-drawer__info-list">
              <div>
                <User size={18} />
                <span>Cliente</span>
                <strong>{order.customer}</strong>
              </div>

              <div>
                <Receipt size={18} />
                <span>Origem</span>
                <strong>{order.origin}</strong>
              </div>

              <div>
                <Storefront size={18} />
                <span>Atendimento</span>
                <strong>{order.fulfillment}</strong>
              </div>

              {order.phone && (
                <div>
                  <Phone size={18} />
                  <span>Contato</span>
                  <strong>{order.phone}</strong>
                </div>
              )}

              {order.tableNumber && (
                <div>
                  <Receipt size={18} />
                  <span>Mesa</span>
                  <strong>
                    Mesa {order.tableNumber}
                  </strong>
                </div>
              )}

              {order.pickupName && (
                <div>
                  <User size={18} />
                  <span>Identificação</span>
                  <strong>{order.pickupName}</strong>
                </div>
              )}
            </div>
          </section>

          {addressLabel && (
            <section className="order-drawer__section">
              <h3>Endereço de entrega</h3>

              <div className="order-drawer__payment">
                <MapPin size={20} />

                <div>
                  <span>Destino</span>
                  <strong>{addressLabel}</strong>
                </div>
              </div>
            </section>
          )}

          <section className="order-drawer__section">
            <h3>Itens do pedido</h3>

            <div className="order-drawer__items">
              {order.itemDetails?.length ? (
                order.itemDetails.map((item) => (
                  <div key={item.productId}>
                    <span>
                      {item.quantity}x {item.name}
                    </span>

                    <strong>
                      {formatCurrency(
                        item.price * item.quantity,
                      )}
                    </strong>
                  </div>
                ))
              ) : (
                <div>
                  <span>{order.items}</span>
                  <strong>{order.total}</strong>
                </div>
              )}
            </div>
          </section>

          <section className="order-drawer__section">
            <h3>Pagamento</h3>

            <div className="order-drawer__payment">
              <CreditCard size={20} />

              <div>
                <span>Forma de pagamento</span>
                <strong>
                  {getPaymentLabel(order)}
                </strong>
              </div>
            </div>

            {order.payment?.needsCardMachine && (
              <div className="order-drawer__payment">
                <CreditCard size={20} />

                <div>
                  <span>Maquininha</span>
                  <strong>
                    Levar na entrega
                  </strong>
                </div>
              </div>
            )}

            {order.payment?.changeFor && (
              <div className="order-drawer__payment">
                <Receipt size={20} />

                <div>
                  <span>Troco para</span>
                  <strong>
                    R$ {order.payment.changeFor}
                  </strong>
                </div>
              </div>
            )}
          </section>

          {order.payment?.observation && (
            <section className="order-drawer__section">
              <h3>Observações</h3>

              <p className="order-drawer__note">
                {order.payment.observation}
              </p>
            </section>
          )}
        </div>

        <div className="order-drawer__footer">
          <div>
            <span>Total</span>
            <strong>{order.total}</strong>
          </div>

          <button
            type="button"
            className="order-drawer__print"
            onClick={() => window.print()}
          >
            <Printer size={18} weight="bold" />
            Imprimir pedido
          </button>
        </div>
      </aside>
    </div>
  );
}