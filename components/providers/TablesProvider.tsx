"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

import type { RestaurantTable } from "@/components/mesas/TableCard";

interface TablesContextValue {
  tables: RestaurantTable[];

  setTables: React.Dispatch<
    React.SetStateAction<RestaurantTable[]>
  >;

  updateTable: (
    tableId: string,
    updatedTable: RestaurantTable,
  ) => void;
}

const TablesContext =
  createContext<TablesContextValue | null>(null);

const initialTables: RestaurantTable[] = [
  {
    id: "table-01",
    number: 1,
    status: "free",
  },
  {
    id: "table-02",
    number: 2,
    status: "occupied",
    customerName: "Carlos",
    people: 3,
    total: 84.9,
    openedAt: "há 42 min",
    commandItems: [],
  },
  {
    id: "table-03",
    number: 3,
    status: "waiting-payment",
    customerName: "Amanda",
    people: 2,
    total: 126.5,
    openedAt: "há 1h 18min",
    commandItems: [],
  },
  {
    id: "table-04",
    number: 4,
    status: "free",
  },
  {
    id: "table-05",
    number: 5,
    status: "occupied",
    customerName: "João",
    people: 4,
    total: 158,
    openedAt: "há 27 min",
    commandItems: [],
  },
  {
    id: "table-06",
    number: 6,
    status: "free",
  },
  {
    id: "table-07",
    number: 7,
    status: "occupied",
    customerName: "Mariana",
    people: 2,
    total: 72.9,
    openedAt: "há 18 min",
    commandItems: [],
  },
  {
    id: "table-08",
    number: 8,
    status: "free",
  },
];

export function TablesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tables, setTables] =
    useState<RestaurantTable[]>(initialTables);

  function updateTable(
    tableId: string,
    updatedTable: RestaurantTable,
  ) {
    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === tableId
          ? updatedTable
          : table,
      ),
    );
  }

  return (
    <TablesContext.Provider
      value={{
        tables,
        setTables,
        updateTable,
      }}
    >
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const context = useContext(TablesContext);

  if (!context) {
    throw new Error(
      "useTables deve ser usado dentro de TablesProvider.",
    );
  }

  return context;
}