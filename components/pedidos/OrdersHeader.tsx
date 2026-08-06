import { Plus } from "@phosphor-icons/react";

export function OrdersHeader() {
  return (
    <section className="orders-header">
      <div>
        <span className="orders-header__eyebrow">
          Central de pedidos
        </span>

        <h1>Pedidos</h1>

        <p>
          Acompanhe todos os pedidos do restaurante em tempo real.
        </p>
      </div>

      <button type="button" className="orders-header__new-order">
        <Plus size={20} weight="bold" />
        Novo pedido
      </button>
    </section>
  );
}