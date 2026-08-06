"use client";

import { useState } from "react";

import { NewOrderDrawer } from "@/components/pedidos/NewOrderDrawer";
import { OrdersBoard } from "@/components/pedidos/OrdersBoard";
import {
  OrdersFilters,
  type OrderFilter,
} from "@/components/pedidos/OrdersFilters";
import { OrdersHeader } from "@/components/pedidos/OrdersHeader";

export default function PedidosPage() {
  const [activeFilter, setActiveFilter] =
    useState<OrderFilter>("Todos");

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewOrderOpen, setIsNewOrderOpen] =
    useState(false);

  return (
    <>
      <OrdersHeader
        onNewOrder={() => setIsNewOrderOpen(true)}
      />

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

      <NewOrderDrawer
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />
    </>
  );
}