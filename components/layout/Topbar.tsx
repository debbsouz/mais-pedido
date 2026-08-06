"use client";

import {
  Bell,
  CaretDown,
} from "@phosphor-icons/react";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__context">
        <span>Painel de gestão</span>
        <strong>Burger House · Unidade Centro</strong>
      </div>

      <div className="topbar__actions">
        <div className="topbar__store-status">
          <span />
          Loja aberta
        </div>

        <button
          type="button"
          className="topbar__notification"
          aria-label="Notificações"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="topbar__profile"
        >
          <span className="topbar__avatar">DS</span>

          <span className="topbar__profile-info">
            <strong>Débora Souza</strong>
            <small>Proprietária</small>
          </span>

          <CaretDown size={16} />
        </button>
      </div>
    </header>
  );
}