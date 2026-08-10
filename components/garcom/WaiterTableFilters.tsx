"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";

import type { RestaurantTable } from "@/components/mesas/TableCard";

export type WaiterTableFilter =
  | "all"
  | "free"
  | "occupied"
  | "waiting-payment";

interface WaiterTableFiltersProps {
  tables: RestaurantTable[];
  activeFilter: WaiterTableFilter;
  searchTerm: string;

  onFilterChange: (
    filter: WaiterTableFilter,
  ) => void;

  onSearchChange: (
    value: string,
  ) => void;
}

export function WaiterTableFilters({
  tables,
  activeFilter,
  searchTerm,
  onFilterChange,
  onSearchChange,
}: WaiterTableFiltersProps) {
  const freeCount = tables.filter(
    (table) => table.status === "free",
  ).length;

  const occupiedCount = tables.filter(
    (table) => table.status === "occupied",
  ).length;

  const closingCount = tables.filter(
    (table) =>
      table.status === "waiting-payment",
  ).length;

  const filters: {
    id: WaiterTableFilter;
    label: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: "Todas",
      count: tables.length,
    },
    {
      id: "free",
      label: "Livres",
      count: freeCount,
    },
    {
      id: "occupied",
      label: "Ocupadas",
      count: occupiedCount,
    },
    {
      id: "waiting-payment",
      label: "Fechamento",
      count: closingCount,
    },
  ];

  return (
    <div className="waiter-table-filters">
      <div className="waiter-table-filters__search">
        <MagnifyingGlass size={19} />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Buscar mesa ou cliente..."
          aria-label="Buscar mesa ou cliente"
        />
      </div>

      <div className="waiter-table-filters__tabs">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={
              activeFilter === filter.id
                ? "waiter-table-filter waiter-table-filter--active"
                : "waiter-table-filter"
            }
            onClick={() =>
              onFilterChange(
                filter.id,
              )
            }
          >
            <span>{filter.label}</span>

            <strong>
              {filter.count}
            </strong>
          </button>
        ))}
      </div>
    </div>
  );
}