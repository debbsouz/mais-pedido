"use client";

import {
  CheckCircle,
  Clock,
  Plus,
  Receipt,
  Users,
} from "@phosphor-icons/react";

import type { RestaurantTable } from "@/components/mesas/TableCard";

interface WaiterTableCardProps {
  table: RestaurantTable;
  onOpen: (table: RestaurantTable) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getStatusLabel(
  status: RestaurantTable["status"],
) {
  if (status === "occupied") {
    return "Ocupada";
  }

  if (status === "waiting-payment") {
    return "Fechamento";
  }

  return "Livre";
}

export function WaiterTableCard({
  table,
  onOpen,
}: WaiterTableCardProps) {
  const isFree =
    table.status === "free";

  return (
    <button
      type="button"
      className={`waiter-table-card waiter-table-card--${table.status}`}
      onClick={() => onOpen(table)}
    >
      <div className="waiter-table-card__top">
        <div>
          <span>Mesa</span>

          <strong>
            {String(table.number).padStart(2, "0")}
          </strong>
        </div>

        <span className="waiter-table-card__status">
          {getStatusLabel(table.status)}
        </span>
      </div>

      {isFree ? (
        <div className="waiter-table-card__free">
          <Plus size={26} weight="bold" />

          <span>Abrir atendimento</span>
        </div>
      ) : (
        <div className="waiter-table-card__content">
          {table.customerName && (
            <div>
              <Users size={16} />

              <span>
                {table.customerName}
              </span>
            </div>
          )}

          {table.people && (
            <div>
              <Users size={16} />

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
              <Clock size={16} />

              <span>
                {table.openedAt}
              </span>
            </div>
          )}

          <div className="waiter-table-card__total">
            <span>
              <Receipt size={16} />
              Comanda
            </span>

            <strong>
              {formatCurrency(
                table.total ?? 0,
              )}
            </strong>
          </div>

          {table.status ===
            "waiting-payment" && (
            <div className="waiter-table-card__payment">
              <CheckCircle
                size={16}
                weight="fill"
              />

              Aguardando pagamento
            </div>
          )}
        </div>
      )}
    </button>
  );
}