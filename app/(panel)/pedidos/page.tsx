"use client";

import { useState } from "react";

import {
  OrdersFilters,
  type OrderFilter,
} from "@/components/pedidos/OrdersFilters";
import { OrdersHeader } from "@/components/pedidos/OrdersHeader";
import { OrdersBoard } from "@/components/pedidos/OrdersBoard";

export default function PedidosPage() {
  const [activeFilter, setActiveFilter] =
    useState<OrderFilter>("Todos");

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <OrdersHeader />

      <OrdersFilters
        activeFilter={activeFilter}
        searchTerm={searchTerm}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchTerm}
      />

      <OrdersBoard
        activeFilter={activeFilter}
        searchTerm={searchTerm}
      />
    </>
  );
}