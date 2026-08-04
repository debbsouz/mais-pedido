"use client";
import {
  Bell,
  CaretDown,
  MagnifyingGlass,
} from "@phosphor-icons/react";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        <MagnifyingGlass size={20} />
        <input
          type="search"
          placeholder="Buscar pedidos, clientes ou produtos..."
          aria-label="Buscar no sistema"
        />
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
          <Bell size={22} />
          <span className="topbar__notification-dot" />
        </button>

        <button type="button" className="topbar__profile">
          <div className="topbar__avatar">DS</div>

          <div className="topbar__profile-text">
            <strong>Débora Souza</strong>
            <span>Proprietária</span>
          </div>

          <CaretDown size={16} />
        </button>
      </div>
    </header>
  );
}