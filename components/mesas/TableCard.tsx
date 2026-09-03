"use client";

import {
  Clock,
  Plus,
  Receipt,
  Users,
} from "@phosphor-icons/react";

import { formatCurrency } from "@/lib/format";
import type { NewOrderItem } from "@/components/pedidos/OrderItemsForm";

export type TableStatus =
  | "free"
  | "occupied"
  | "waiting-payment";

export interface RestaurantTable {
  id: string;
  number: number;
  status: TableStatus;

  customerName?: string;
  people?: number;
  total?: number;
  openedAt?: string;

  commandItems?: NewOrderItem[];
}

interface TableCardProps {
  table: RestaurantTable;

  onOpen: (
    table: RestaurantTable,
  ) => void;
}


function getStatusLabel(
  status: TableStatus,
) {
  if (status === "occupied") {
    return "Ocupada";
  }

  if (
    status ===
    "waiting-payment"
  ) {
    return "Fechamento";
  }

  return "Livre";
}

export function TableCard({
  table,
  onOpen,
}: TableCardProps) {
  const totalItems =
    table.commandItems?.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    ) ?? 0;

  const isFree =
    table.status === "free";

  const isWaitingPayment =
    table.status ===
    "waiting-payment";

  return (
    <article
      className={`table-card table-card--${table.status}`}
      onClick={() =>
        onOpen(table)
      }
    >
      {isWaitingPayment && (
        <div className="table-card__closing-alert">
          Pagamento solicitado
        </div>
      )}

      <header className="table-card__header">
        <div className="table-card__number">
          <span>Mesa</span>

          <strong>
            {String(
              table.number,
            ).padStart(2, "0")}
          </strong>
        </div>

        <span
          className={`table-card__status table-card__status--${table.status}`}
        >
          {getStatusLabel(
            table.status,
          )}
        </span>
      </header>

      {isFree ? (
        <div className="table-card__free">
          <div className="table-card__free-icon">
            <Plus
              size={24}
              weight="bold"
            />
          </div>

          <strong>
            Abrir mesa
          </strong>

          <span>
            Toque para iniciar um
            atendimento
          </span>
        </div>
      ) : (
        <>
          <div className="table-card__details">
            {table.customerName && (
              <div>
                <Users
                  size={18}
                  weight="bold"
                />

                <span>
                  {
                    table.customerName
                  }
                </span>
              </div>
            )}

            {table.people && (
              <div>
                <Users size={18} />

                <span>
                  {table.people}{" "}
                  {table.people === 1
                    ? "pessoa"
                    : "pessoas"}
                </span>
              </div>
            )}

            {table.openedAt && (
              <div>
                <Clock size={18} />

                <span>
                  Aberta{" "}
                  {table.openedAt}
                </span>
              </div>
            )}

            {totalItems > 0 && (
              <div>
                <Receipt size={18} />

                <span>
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "itens"}{" "}
                  na comanda
                </span>
              </div>
            )}
          </div>

          <div className="table-card__total">
            <span>
              <Receipt
                size={17}
                weight="bold"
              />

              Comanda
            </span>

            <strong>
              {formatCurrency(
                table.total ?? 0,
              )}
            </strong>
          </div>
        </>
      )}
    </article>
  );
}