"use client";

import {
  Check,
  Clock,
  CookingPot,
  Motorcycle,
  Package,
  Storefront,
  Table,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "delivery";

export type OrderOrigin =
  | "Site"
  | "WhatsApp"
  | "Garçom"
  | "Atendente";

export type OrderFulfillment =
  | "Delivery"
  | "Retirada"
  | "Mesa"
  | "Balcão";

export type OrderPaymentMethod =
  | "Pix"
  | "Dinheiro"
  | "Crédito"
  | "Débito"
  | "Comanda";

export type OrderCardBrand =
  | "Visa"
  | "Mastercard"
  | "Elo"
  | "Hipercard";

export interface OrderItemDetail {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
}

export interface OrderPaymentDetails {
  method: OrderPaymentMethod;
  cardBrand: OrderCardBrand | null;
  needsCardMachine: boolean;
  changeFor: string;
  observation: string;
}

export interface Order {
  id: string;
  customer: string;
  origin: OrderOrigin;
  fulfillment: OrderFulfillment;
  time: string;
  total: string;
  items: string;
  status: OrderStatus;
  delayed?: boolean;

  createdAt?: number;
  phone?: string;
  tableNumber?: string;
  pickupName?: string;
  address?: OrderAddress;
  itemDetails?: OrderItemDetail[];
  payment?: OrderPaymentDetails;
}

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onAdvance: (orderId: string) => void;
  onOpen: (order: Order) => void;
}

function FulfillmentIcon({
  fulfillment,
}: {
  fulfillment: OrderFulfillment;
}) {
  if (fulfillment === "Delivery") {
    return <Motorcycle size={15} weight="bold" />;
  }

  if (fulfillment === "Mesa") {
    return <Table size={15} weight="bold" />;
  }

  return <Storefront size={15} weight="bold" />;
}

function AdvanceIcon({
  status,
  fulfillment,
}: {
  status: OrderStatus;
  fulfillment: OrderFulfillment;
}) {
  if (status === "preparing") {
    return <Package size={17} weight="bold" />;
  }

  if (
    status === "ready" &&
    fulfillment === "Delivery"
  ) {
    return <Motorcycle size={17} weight="bold" />;
  }

  return <Check size={17} weight="bold" />;
}

function getAdvanceLabel(
  status: OrderStatus,
  fulfillment: OrderFulfillment,
) {
  if (status === "preparing") {
    return "Marcar como pronto";
  }

  if (status === "ready") {
    return fulfillment === "Delivery"
      ? "Enviar para entrega"
      : "Finalizar pedido";
  }

  if (status === "delivery") {
    return "Finalizar entrega";
  }

  return null;
}

function formatElapsedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export function OrderCard({
  order,
  onAccept,
  onReject,
  onAdvance,
  onOpen,
}: OrderCardProps) {
  const {
    id,
    customer,
    origin,
    fulfillment,
    time,
    total,
    items,
    status,
    delayed = false,
    createdAt,
  } = order;

  const [elapsedSeconds, setElapsedSeconds] =
    useState(() => {
      if (!createdAt) {
        return 0;
      }

      return Math.max(
        0,
        Math.floor((Date.now() - createdAt) / 1000),
      );
    });

  useEffect(() => {
    if (!createdAt || status !== "new") {
      return;
    }

    const updateElapsedTime = () => {
      setElapsedSeconds(
        Math.max(
          0,
          Math.floor(
            (Date.now() - createdAt) / 1000,
          ),
        ),
      );
    };

    updateElapsedTime();

    const interval = window.setInterval(
      updateElapsedTime,
      1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [createdAt, status]);

  const originClass = origin
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const advanceLabel = getAdvanceLabel(
    status,
    fulfillment,
  );

  const waitingMinutes = elapsedSeconds / 60;

  const urgencyClass =
    status !== "new" || !createdAt
      ? ""
      : waitingMinutes >= 10
        ? "order-card--critical"
        : waitingMinutes >= 5
          ? "order-card--warning"
          : "";

  return (
    <article
      className={`order-card ${
        delayed ? "order-card--delayed" : ""
      } ${
        status === "new" ? "order-card--new" : ""
      } ${urgencyClass}`}
      onClick={() => onOpen(order)}
    >
      {status === "new" && (
        <div className="order-card__new-label">
          <span />
          Novo pedido
        </div>
      )}

      <div className="order-card__header">
        <div>
          <span className="order-card__id">
            #{id}
          </span>

          <strong>{customer}</strong>
        </div>

        <span
          className={`order-card__origin order-card__origin--${originClass}`}
        >
          {origin}
        </span>
      </div>

      <div className="order-card__fulfillment">
        <FulfillmentIcon
          fulfillment={fulfillment}
        />

        <span>{fulfillment}</span>
      </div>

      <p className="order-card__items">{items}</p>

      <div className="order-card__footer">
        {createdAt && status === "new" ? (
          <span className="order-card__timer">
            <Clock size={14} weight="bold" />
            {formatElapsedTime(elapsedSeconds)}
          </span>
        ) : (
          <span>{time}</span>
        )}

        <strong>{total}</strong>
      </div>

      {status === "new" && (
        <div className="order-card__actions">
          <button
            type="button"
            className="order-card__action order-card__action--reject"
            onClick={(event) => {
              event.stopPropagation();
              onReject(id);
            }}
          >
            <X size={16} weight="bold" />
            Recusar
          </button>

          <button
            type="button"
            className="order-card__action order-card__action--accept"
            onClick={(event) => {
              event.stopPropagation();
              onAccept(id);
            }}
          >
            <Check size={16} weight="bold" />
            Aceitar
          </button>
        </div>
      )}

      {status !== "new" && advanceLabel && (
        <button
          type="button"
          className="order-card__advance"
          onClick={(event) => {
            event.stopPropagation();
            onAdvance(id);
          }}
        >
          <AdvanceIcon
            status={status}
            fulfillment={fulfillment}
          />

          {advanceLabel}
        </button>
      )}

      {status === "preparing" && (
        <div className="order-card__preparing-note">
          <CookingPot size={15} />
          Pedido em produção
        </div>
      )}
    </article>
  );
}