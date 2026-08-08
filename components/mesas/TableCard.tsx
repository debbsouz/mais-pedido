"use client";

import {
  Clock,
  Plus,
  Receipt,
  Users,
} from "@phosphor-icons/react";

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
  onOpen: (table: RestaurantTable) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getStatusLabel(status: TableStatus) {
  if (status === "occupied") {
    return "Ocupada";
  }

  if (status === "waiting-payment") {
    return "Aguardando pagamento";
  }

  return "Livre";
}

export function TableCard({
  table,
  onOpen,
}: TableCardProps) {
  return (
    <article
      className={`table-card table-card--${table.status}`}
      onClick={() => onOpen(table)}
    >
      <header className="table-card__header">
        <div>
          <span>Mesa</span>

          <strong>
            {String(table.number).padStart(2, "0")}
          </strong>
        </div>

        <span
          className={`table-card__status table-card__status--${table.status}`}
        >
          {getStatusLabel(table.status)}
        </span>
      </header>

      {table.status === "free" ? (
        <div className="table-card__free">
          <Plus size={26} weight="bold" />

          <strong>Abrir mesa</strong>

          <span>
            Toque para iniciar um atendimento.
          </span>
        </div>
      ) : (
        <>
          <div className="table-card__details">
            {table.customerName && (
              <div>
                <Users size={17} />
                <span>{table.customerName}</span>
              </div>
            )}

            {table.people && (
              <div>
                <Users size={17} />

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
                <Clock size={17} />

                <span>
                  Aberta {table.openedAt}
                </span>
              </div>
            )}

            {table.commandItems &&
              table.commandItems.length > 0 && (
                <div>
                  <Receipt size={17} />

                  <span>
                    {table.commandItems.reduce(
                      (total, item) =>
                        total + item.quantity,
                      0,
                    )}{" "}
                    itens na comanda
                  </span>
                </div>
              )}
          </div>

          <div className="table-card__total">
            <span>
              <Receipt size={16} />
              Comanda
            </span>

            <strong>
              {formatCurrency(table.total ?? 0)}
            </strong>
          </div>
        </>
      )}
    </article>
  );
}