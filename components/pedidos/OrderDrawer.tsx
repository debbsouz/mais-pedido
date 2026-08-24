"use client";

import {
  CreditCard,
  MapPin,
  NotePencil,
  Phone,
  Printer,
  Receipt,
  Storefront,
  User,
  X,
} from "@phosphor-icons/react";

import {
  formatCurrency,
  getPaymentLabel,
  getShortOrderCode,
} from "@/lib/format";

import type { Order } from "./OrderCard";

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
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
            <span>Pedido {getShortOrderCode(order.id)}</span>
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

          {order.observation && (
            <section className="order-drawer__section">
              <h3>Observações</h3>

              <p className="order-drawer__note">
                {order.observation}
              </p>
            </section>
          )}

          <section className="order-drawer__section">
            <h3>Pagamento</h3>

            <div className="order-drawer__payment">
              <CreditCard size={20} />

              <div>
                <span>Forma de pagamento</span>
                <strong>
                  {getPaymentLabel(order.payment)}
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

            {order.payment?.observation && (
              <div className="order-drawer__payment">
                <NotePencil size={20} />

                <div>
                  <span>Observação do pagamento</span>
                  <strong>
                    {order.payment.observation}
                  </strong>
                </div>
              </div>
            )}
          </section>
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

      <div className="order-print-ticket">
        <div className="order-print-ticket__header">
          <strong>
            Pedido {getShortOrderCode(order.id)}
          </strong>

          <span>
            {order.fulfillment}
            {order.tableNumber
              ? ` · Mesa ${order.tableNumber}`
              : ""}
          </span>
        </div>

        <div className="order-print-ticket__row">
          <span>Cliente</span>
          <strong>{order.customer}</strong>
        </div>

        {order.phone && (
          <div className="order-print-ticket__row">
            <span>Telefone</span>
            <strong>{order.phone}</strong>
          </div>
        )}

        {addressLabel && (
          <div className="order-print-ticket__row">
            <span>Endereço</span>
            <strong>{addressLabel}</strong>
          </div>
        )}

        <div className="order-print-ticket__divider" />

        <div className="order-print-ticket__items">
          {order.itemDetails?.length ? (
            order.itemDetails.map((item) => (
              <div key={item.productId}>
                <span>
                  {item.quantity}x {item.name}
                </span>

                <span>
                  {formatCurrency(
                    item.price * item.quantity,
                  )}
                </span>
              </div>
            ))
          ) : (
            <div>
              <span>{order.items}</span>
            </div>
          )}
        </div>

        <div className="order-print-ticket__divider" />

        {order.observation && (
          <>
            <p className="order-print-ticket__note">
              Obs: {order.observation}
            </p>

            <div className="order-print-ticket__divider" />
          </>
        )}

        <div className="order-print-ticket__row order-print-ticket__total">
          <span>Total</span>
          <strong>{order.total}</strong>
        </div>

        <div className="order-print-ticket__row">
          <span>Pagamento</span>
          <strong>
            {getPaymentLabel(order.payment)}
          </strong>
        </div>
      </div>
    </div>
  );
}