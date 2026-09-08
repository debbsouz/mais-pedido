"use client";

import {
  CalendarBlank,
  CheckCircle,
  Clock,
  CurrencyCircleDollar,
  MapPin,
  Phone,
  Receipt,
  ShoppingBag,
  User,
  X,
} from "@phosphor-icons/react";

import { formatCurrency } from "@/lib/format";

import type { CustomerDto } from "@/app/actions/customers";

interface CustomerProfileDrawerProps {
  open: boolean;
  customer: CustomerDto | null;
  onClose: () => void;
}

export function CustomerProfileDrawer({
  open,
  customer,
  onClose,
}: CustomerProfileDrawerProps) {
  if (!open || !customer) return null;

  const averageTicket =
    customer.ordersCount > 0
      ? customer.totalSpentCents /
        100 /
        customer.ordersCount
      : 0;

  return (
    <div className="customer-profile">
      <button
        type="button"
        className="customer-profile__backdrop"
        onClick={onClose}
        aria-label="Fechar perfil"
      />

      <aside className="customer-profile__panel">
        <header className="customer-profile__header">
          <div>
            <span>Perfil do cliente</span>
            <h2>{customer.name}</h2>

            <p>
              Informações e histórico de pedidos.
            </p>
          </div>

          <button
            type="button"
            className="customer-profile__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        <div className="customer-profile__content">
          <section className="customer-profile__identity">
            <div className="customer-profile__avatar">
              <User size={28} weight="bold" />
            </div>

            <div>
              <strong>{customer.name}</strong>

              <span>
                <Phone size={14} />
                {customer.phone}
              </span>

              <small>
                <CalendarBlank size={13} />
                Cliente desde{" "}
                {customer.customerSince.toLocaleDateString(
                  "pt-BR",
                )}
              </small>
            </div>
          </section>

          <section className="customer-profile__metrics">
            <article>
              <ShoppingBag size={19} />

              <div>
                <span>Pedidos</span>
                <strong>{customer.ordersCount}</strong>
              </div>
            </article>

            <article>
              <CurrencyCircleDollar size={19} />

              <div>
                <span>Total gasto</span>
                <strong>
                  {formatCurrency(
                    customer.totalSpentCents / 100,
                  )}
                </strong>
              </div>
            </article>

            <article>
              <Receipt size={19} />

              <div>
                <span>Ticket médio</span>
                <strong>
                  {formatCurrency(averageTicket)}
                </strong>
              </div>
            </article>
          </section>

          {(customer.address || customer.email) && (
            <section className="customer-profile__section">
              <div className="customer-profile__section-title">
                <MapPin size={18} />

                <div>
                  <strong>Contato e endereço</strong>
                  <span>
                    Dados cadastrados deste cliente.
                  </span>
                </div>
              </div>

              {customer.email && (
                <div className="customer-profile__address">
                  <span>{customer.email}</span>
                </div>
              )}

              {customer.address && (
                <div className="customer-profile__address">
                  <MapPin size={17} />
                  <span>{customer.address}</span>
                </div>
              )}
            </section>
          )}

          <section className="customer-profile__section">
            <div className="customer-profile__section-title">
              <Clock size={18} />

              <div>
                <strong>Histórico de pedidos</strong>

                <span>
                  Últimos pedidos realizados pelo
                  cliente.
                </span>
              </div>
            </div>

            {customer.history.length > 0 ? (
              <div className="customer-profile__history">
                {customer.history.map((order) => (
                  <article
                    key={order.id}
                    className="customer-history-order"
                  >
                    <div className="customer-history-order__top">
                      <div>
                        <strong>
                          #{order.displayNumber}
                        </strong>

                        <span>{order.date}</span>
                      </div>

                      <strong>
                        {formatCurrency(
                          order.totalCents / 100,
                        )}
                      </strong>
                    </div>

                    <p>{order.items}</p>

                    <div className="customer-history-order__bottom">
                      <span>{order.channel}</span>

                      <span data-status={order.status}>
                        {order.status ===
                          "Concluído" && (
                          <CheckCircle
                            size={13}
                            weight="fill"
                          />
                        )}

                        {order.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="customer-profile__empty">
                <ShoppingBag size={24} />

                <span>Nenhum pedido encontrado.</span>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
