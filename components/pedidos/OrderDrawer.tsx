"use client";

import {
  CreditCard,
  MapPin,
  Phone,
  Printer,
  Receipt,
  User,
  X,
} from "@phosphor-icons/react";

import type { Order } from "./OrderCard";

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDrawer({
  order,
  onClose,
}: OrderDrawerProps) {
  if (!order) {
    return null;
  }

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
                <MapPin size={18} />
                <span>Atendimento</span>
                <strong>{order.fulfillment}</strong>
              </div>

              <div>
                <Phone size={18} />
                <span>Contato</span>
                <strong>(51) 99999-9999</strong>
              </div>
            </div>
          </section>

          <section className="order-drawer__section">
            <h3>Itens do pedido</h3>

            <div className="order-drawer__items">
              <div>
                <span>2x X-Burger</span>
                <strong>R$ 44,00</strong>
              </div>

              <div>
                <span>1x Batata grande</span>
                <strong>R$ 18,90</strong>
              </div>

              <div>
                <span>Adicionais</span>
                <strong>R$ 10,00</strong>
              </div>
            </div>
          </section>

          <section className="order-drawer__section">
            <h3>Pagamento</h3>

            <div className="order-drawer__payment">
              <CreditCard size={20} />

              <div>
                <span>Forma de pagamento</span>
                <strong>Pix</strong>
              </div>
            </div>
          </section>

          <section className="order-drawer__section">
            <h3>Observações</h3>

            <p className="order-drawer__note">
              Sem cebola e com molho separado.
            </p>
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
    </div>
  );
}