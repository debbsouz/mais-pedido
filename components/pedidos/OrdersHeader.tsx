"use client";

import { Plus } from "@phosphor-icons/react";

interface OrdersHeaderProps {
  onNewOrder: () => void;
}

export function OrdersHeader({
  onNewOrder,
}: OrdersHeaderProps) {
  return (
    <section className="orders-header">
      <div>
        <span className="orders-header__eyebrow">
          Central de pedidos
        </span>

        <h1>Pedidos</h1>

        <p>
          Acompanhe todos os pedidos do restaurante em
          tempo real.
        </p>
      </div>

      <button
        type="button"
        className="orders-header__new-order"
        onClick={onNewOrder}
      >
        <Plus size={20} weight="bold" />
        Novo pedido
      </button>
    </section>
  );
}