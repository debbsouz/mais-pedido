"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

import type {
  Order,
  OrderStatus,
} from "@/components/pedidos/OrderCard";

interface OrdersContextValue {
  orders: Order[];

  setOrders: React.Dispatch<
    React.SetStateAction<Order[]>
  >;

  moveOrder: (
    orderId: string,
    status: OrderStatus,
  ) => void;

  addOrder: (order: Order) => void;

  removeOrder: (orderId: string) => void;
}

const OrdersContext =
  createContext<OrdersContextValue | null>(null);

const initialOrders: Order[] = [
  {
    id: "1052",
    customer: "Amanda Rocha",
    origin: "WhatsApp",
    fulfillment: "Retirada",
    time: "há 7 min",
    total: "R$ 72,90",
    items: "2 X-Burgers, 1 batata grande",
    status: "new",
    delayed: true,
  },

  {
    id: "1051",
    customer: "Mesa 04",
    origin: "Garçom",
    fulfillment: "Mesa",
    time: "há 4 min",
    total: "R$ 118,50",
    items: "1 pizza grande, 2 refrigerantes",
    status: "new",
  },

  {
    id: "1050",
    customer: "Carlos Lima",
    origin: "Site",
    fulfillment: "Delivery",
    time: "há 2 min",
    total: "R$ 46,00",
    items: "1 combo família",
    status: "new",
  },

  {
    id: "1049",
    customer: "Mesa 08",
    origin: "Garçom",
    fulfillment: "Mesa",
    time: "há 12 min",
    total: "R$ 96,50",
    items: "2 hambúrgueres, 1 porção",
    status: "preparing",
  },

  {
    id: "1048",
    customer: "Mariana Alves",
    origin: "Site",
    fulfillment: "Delivery",
    time: "há 15 min",
    total: "R$ 58,90",
    items: "1 X-Salada, 1 refrigerante",
    status: "preparing",
  },

  {
    id: "1047",
    customer: "João Pedro",
    origin: "Atendente",
    fulfillment: "Balcão",
    time: "há 18 min",
    total: "R$ 38,00",
    items: "1 cachorro-quente, 1 suco",
    status: "preparing",
  },

  {
    id: "1046",
    customer: "Fernanda Souza",
    origin: "WhatsApp",
    fulfillment: "Retirada",
    time: "pronto há 3 min",
    total: "R$ 64,00",
    items: "2 combos tradicionais",
    status: "ready",
  },

  {
    id: "1045",
    customer: "Mesa 12",
    origin: "Garçom",
    fulfillment: "Mesa",
    time: "pronto há 5 min",
    total: "R$ 132,90",
    items: "1 pizza família, bebidas",
    status: "ready",
  },

  {
    id: "1044",
    customer: "Rafael Martins",
    origin: "Site",
    fulfillment: "Delivery",
    time: "saiu há 8 min",
    total: "R$ 84,50",
    items: "2 hambúrgueres especiais",
    status: "delivery",
  },

  {
    id: "1043",
    customer: "Patrícia Lopes",
    origin: "WhatsApp",
    fulfillment: "Delivery",
    time: "aguardando entregador",
    total: "R$ 52,00",
    items: "1 combo individual",
    status: "delivery",
  },
];

export function OrdersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [orders, setOrders] =
    useState<Order[]>(initialOrders);

  function moveOrder(
    orderId: string,
    status: OrderStatus,
  ) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              delayed: false,
            }
          : order,
      ),
    );
  }

  function addOrder(order: Order) {
    setOrders((currentOrders) => {
      const alreadyExists =
        currentOrders.some(
          (currentOrder) =>
            currentOrder.id === order.id,
        );

      if (alreadyExists) {
        return currentOrders;
      }

      return [order, ...currentOrders];
    });
  }

  function removeOrder(orderId: string) {
    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) => order.id !== orderId,
      ),
    );
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        setOrders,
        moveOrder,
        addOrder,
        removeOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error(
      "useOrders deve ser usado dentro de OrdersProvider.",
    );
  }

  return context;
}