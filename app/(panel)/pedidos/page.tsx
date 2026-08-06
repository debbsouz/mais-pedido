"use client";

import { useCallback, useState } from "react";

import { NewOrderDrawer } from "@/components/pedidos/NewOrderDrawer";
import type { Order } from "@/components/pedidos/OrderCard";
import {
  initialOrders,
  OrdersBoard,
} from "@/components/pedidos/OrdersBoard";
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

  const [orders, setOrders] =
    useState<Order[]>(initialOrders);

  const openNewOrderDrawer = useCallback(() => {
    setIsNewOrderOpen(true);
  }, []);

  const closeNewOrderDrawer = useCallback(() => {
    setIsNewOrderOpen(false);
  }, []);

  const handleCreateOrder = useCallback(
    (order: Order) => {
      setOrders((currentOrders) => [
        order,
        ...currentOrders,
      ]);

      setIsNewOrderOpen(false);
      setActiveFilter("Todos");
      setSearchTerm("");
    },
    [],
  );

  return (
    <>
      <OrdersHeader
        onNewOrder={openNewOrderDrawer}
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
        orders={orders}
        onOrdersChange={setOrders}
      />

      <NewOrderDrawer
        isOpen={isNewOrderOpen}
        onClose={closeNewOrderDrawer}
        onCreateOrder={handleCreateOrder}
      />
    </>
  );
}