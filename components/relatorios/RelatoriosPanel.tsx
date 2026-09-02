"use client";

import {
  ChartBar,
  ChartLine,
  ClockCountdown,
  Trophy,
} from "@phosphor-icons/react";

import { formatCurrency } from "@/lib/format";
import type { ReportsSummary } from "@/lib/relatorios-dal";

interface RelatoriosPanelProps {
  summary: ReportsSummary | null;
}

function reais(cents: number) {
  return formatCurrency(cents / 100);
}

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}h`;
}

export function RelatoriosPanel({
  summary,
}: RelatoriosPanelProps) {
  return (
    <>
      <header className="financeiro-header">
        <div>
          <span className="financeiro-header__eyebrow">
            <ChartBar size={16} weight="bold" />
            Relatórios
          </span>

          <h1>Relatórios</h1>

          <p>
            {summary && summary.periodOrderCount > 0
              ? `Com base em ${summary.periodOrderCount} pedido(s) dos últimos 30 dias.`
              : "O que mais vende, em que status os pedidos estão e os horários de maior movimento."}
          </p>
        </div>
      </header>

      {summary && summary.periodOrderCount === 0 && (
        <div className="financeiro-empty">
          <span>
            <ChartLine size={26} weight="bold" />
          </span>
          <h2>Nenhum pedido nos últimos 30 dias</h2>
          <p>
            Assim que novos pedidos entrarem, os relatórios
            aparecem aqui automaticamente.
          </p>
        </div>
      )}

      {summary && summary.periodOrderCount > 0 && (
        <div className="financeiro-grid financeiro-grid--relatorios">
          <section className="financeiro-card">
            <h2>
              <Trophy size={15} weight="bold" />
              Produtos mais vendidos
            </h2>

            <ul className="financeiro-breakdown">
              {summary.topProducts.map((product) => (
                <li key={product.name}>
                  <div>
                    <span>{product.name}</span>
                    <small>{product.quantity} unidade(s)</small>
                  </div>
                  <strong>{reais(product.totalCents)}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="financeiro-card">
            <h2>Pedidos por status</h2>

            <ul className="financeiro-breakdown">
              {summary.ordersByStatus.map((entry) => (
                <li key={entry.status}>
                  <div>
                    <span>{entry.status}</span>
                  </div>
                  <strong>{entry.orderCount}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="financeiro-card">
            <h2>
              <ClockCountdown size={15} weight="bold" />
              Horários de pico
            </h2>

            <ul className="financeiro-breakdown">
              {summary.peakHours.map((entry) => (
                <li key={entry.hour}>
                  <div>
                    <span>{hourLabel(entry.hour)}</span>
                  </div>
                  <strong>
                    {entry.orderCount} pedido(s)
                  </strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
