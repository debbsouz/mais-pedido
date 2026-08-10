"use client";

import {
  Bell,
  UserCircle,
} from "@phosphor-icons/react";

export function WaiterHeader() {
  return (
    <header className="waiter-header">
      <div>
        <span className="waiter-header__brand">
          +Pedido
        </span>

        <strong>Burger House</strong>
      </div>

      <div className="waiter-header__actions">
        <button
          type="button"
          aria-label="Notificações"
        >
          <Bell size={20} />
        </button>

        <div className="waiter-header__user">
          <UserCircle size={30} />

          <div>
            <strong>João</strong>
            <span>Garçom</span>
          </div>
        </div>
      </div>
    </header>
  );
}