"use client";

import {
  Plus,
  Table,
} from "@phosphor-icons/react";

export function TablesHeader() {
  return (
    <header className="tables-header">
      <div>
        <span className="tables-header__eyebrow">
          <Table size={16} weight="bold" />
          Salão
        </span>

        <h1>Mesas</h1>

        <p>
          Acompanhe ocupação, comandas e atendimento
          do salão.
        </p>
      </div>

      <button
        type="button"
        className="tables-header__new"
      >
        <Plus size={18} weight="bold" />
        Abrir mesa
      </button>
    </header>
  );
}