"use client";

import { WarningCircle } from "@phosphor-icons/react";

export function OperationAlert() {
  return (
    <section className="dashboard__alert">
      <div className="dashboard__alert-icon">
        <WarningCircle size={24} weight="fill" />
      </div>

      <div>
        <strong>3 pedidos aguardando confirmação</strong>
        <p>O pedido mais antigo está esperando há 6 minutos.</p>
      </div>

      <button type="button">Ver pedidos</button>
    </section>
  );
}