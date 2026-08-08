"use client";

import {
  Clock,
  CookingPot,
} from "@phosphor-icons/react";

export function KitchenHeader() {
  return (
    <header className="kitchen-header">
      <div>
        <span className="kitchen-header__eyebrow">
          <CookingPot size={16} weight="bold" />
          Produção
        </span>

        <h1>Cozinha</h1>

        <p>
          Acompanhe e organize os pedidos em
          preparo.
        </p>
      </div>

      <div className="kitchen-header__status">
        <Clock size={18} weight="bold" />

        <div>
          <span>Operação</span>
          <strong>Em andamento</strong>
        </div>
      </div>
    </header>
  );
}