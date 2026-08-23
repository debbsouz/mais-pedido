"use client";

import {
  Clock,
  CookingPot,
} from "@phosphor-icons/react";

export function KitchenHeader() {
  return (
    <header className="kitchen-header">
      <div className="kitchen-header__content">
        <span className="kitchen-header__eyebrow">
          <CookingPot
            size={16}
            weight="bold"
          />

          Produção
        </span>

        <h1>Cozinha</h1>

        <p>
          Acompanhe e organize os pedidos
          em preparo.
        </p>
      </div>

      <div className="kitchen-header__status">
        <span className="kitchen-header__status-icon">
          <Clock
            size={18}
            weight="bold"
          />
        </span>

        <div className="kitchen-header__status-content">
          <span>Operação</span>

          <strong>
            Em andamento
          </strong>
        </div>
      </div>
    </header>
  );
}