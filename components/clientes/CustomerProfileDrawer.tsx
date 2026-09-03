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
  Star,
  User,
  X,
} from "@phosphor-icons/react";

import { formatCurrency } from "@/lib/format";

export interface CustomerHistoryOrder {
  id: string;
  displayNumber: string;
  date: string;
  total: number;
  channel: "Delivery" | "Retirada" | "Mesa";
  status: "Concluído" | "Cancelado";
  items: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  customerSince: string;
  loyaltyProgress: number;
  loyaltyGoal: number;
  address?: string;
  history: CustomerHistoryOrder[];
}

interface CustomerProfileDrawerProps {
  open: boolean;
  customer: CustomerProfile | null;
  onClose: () => void;
}

export function CustomerProfileDrawer({
  open,
  customer,
  onClose,
}: CustomerProfileDrawerProps) {
  if (!open || !customer) return null;

  const averageTicket =
    customer.orders > 0
      ? customer.totalSpent / customer.orders
      : 0;

  const loyaltyPercentage =
    customer.loyaltyGoal > 0
      ? Math.min(
          100,
          Math.round(
            (customer.loyaltyProgress /
              customer.loyaltyGoal) *
              100,
          ),
        )
      : 0;

  const remainingOrders = Math.max(
    0,
    customer.loyaltyGoal -
      customer.loyaltyProgress,
  );

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
              Informações, relacionamento e histórico
              de pedidos.
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
                Cliente desde {customer.customerSince}
              </small>
            </div>
          </section>

          <section className="customer-profile__metrics">
            <article>
              <ShoppingBag size={19} />

              <div>
                <span>Pedidos</span>
                <strong>{customer.orders}</strong>
              </div>
            </article>

            <article>
              <CurrencyCircleDollar size={19} />

              <div>
                <span>Total gasto</span>
                <strong>
                  {formatCurrency(customer.totalSpent)}
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

          <section className="customer-profile__section">
            <div className="customer-profile__section-title">
              <Star size={18} weight="fill" />

              <div>
                <strong>Fidelidade</strong>
                <span>
                  Acompanhe o progresso deste cliente.
                </span>
              </div>
            </div>

            <div className="customer-profile__loyalty">
              <div className="customer-profile__loyalty-top">
                <div>
                  <strong>
                    {customer.loyaltyProgress}/
                    {customer.loyaltyGoal} pedidos
                  </strong>

                  <span>
                    {remainingOrders === 0
                      ? "Recompensa disponível"
                      : remainingOrders === 1
                        ? "Falta 1 pedido para a recompensa"
                        : `Faltam ${remainingOrders} pedidos para a recompensa`}
                  </span>
                </div>

                <strong>
                  {loyaltyPercentage}%
                </strong>
              </div>

              <div className="customer-profile__loyalty-bar">
                <span
                  style={{
                    width: `${loyaltyPercentage}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {customer.address && (
            <section className="customer-profile__section">
              <div className="customer-profile__section-title">
                <MapPin size={18} />

                <div>
                  <strong>Endereço recente</strong>
                  <span>
                    Último endereço utilizado em entrega.
                  </span>
                </div>
              </div>

              <div className="customer-profile__address">
                <MapPin size={17} />

                <span>{customer.address}</span>
              </div>
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
                        {formatCurrency(order.total)}
                      </strong>
                    </div>

                    <p>{order.items}</p>

                    <div className="customer-history-order__bottom">
                      <span>
                        {order.channel}
                      </span>

                      <span
                        data-status={order.status}
                      >
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

                <span>
                  Nenhum pedido encontrado.
                </span>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}