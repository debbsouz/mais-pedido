"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

export type OrderFilter =
  | "Todos"
  | "Delivery"
  | "Retirada"
  | "Mesa"
  | "Balcão"
  | "WhatsApp";

interface OrdersFiltersProps {
  activeFilter: OrderFilter;
  searchTerm: string;
  onFilterChange: (filter: OrderFilter) => void;
  onSearchChange: (value: string) => void;
}

const filters: OrderFilter[] = [
  "Todos",
  "Delivery",
  "Retirada",
  "Mesa",
  "Balcão",
  "WhatsApp",
];

export function OrdersFilters({
  activeFilter,
  searchTerm,
  onFilterChange,
  onSearchChange,
}: OrdersFiltersProps) {
  return (
    <section className="orders-filters">
      <div className="orders-filters__search">
        <MagnifyingGlass size={20} />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por pedido, cliente ou item..."
          aria-label="Buscar pedidos"
        />
      </div>

      <div className="orders-filters__buttons">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={
              activeFilter === filter
                ? "orders-filter orders-filter--active"
                : "orders-filter"
            }
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </section>
  );
}