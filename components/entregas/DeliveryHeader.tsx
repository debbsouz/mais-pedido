"use client";

import {
  Motorcycle,
  NavigationArrow,
} from "@phosphor-icons/react";

export function DeliveryHeader() {
  return (
    <header className="delivery-header">
      <div>
        <span className="delivery-header__eyebrow">
          <Motorcycle size={16} weight="bold" />
          Operação externa
        </span>

        <h1>Entregas</h1>

        <p>
          Acompanhe os pedidos que estão aguardando
          saída ou já estão em rota.
        </p>
      </div>

      <div className="delivery-header__status">
        <NavigationArrow
          size={18}
          weight="bold"
        />

        <div>
          <span>Entregas</span>
          <strong>Em operação</strong>
        </div>
      </div>
    </header>
  );
}