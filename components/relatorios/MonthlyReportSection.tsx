"use client";

import {
  ChartLineUp,
  FileText,
  TrendDown,
  TrendUp,
} from "@phosphor-icons/react";

import { formatCurrency } from "@/lib/format";
import type { MonthlyReport } from "@/lib/monthly-report-dal";

interface MonthlyReportSectionProps {
  report: MonthlyReport | null;
}

function reais(cents: number) {
  return formatCurrency(cents / 100);
}

export function MonthlyReportSection({
  report,
}: MonthlyReportSectionProps) {
  if (!report) {
    return null;
  }

  const { currentMonth, previousMonth, revenueGrowthPercent, topProducts } =
    report;

  const hasActivity =
    currentMonth.orderCount > 0 || previousMonth.orderCount > 0;

  return (
    <section className="purchases-section">
      <div className="financeiro-header financeiro-header--secondary">
        <div>
          <h2>Relatório executivo mensal</h2>
          <p>
            {currentMonth.label} comparado com {previousMonth.label}.
          </p>
        </div>
      </div>

      {!hasActivity ? (
        <div className="financeiro-empty">
          <span>
            <FileText size={26} weight="bold" />
          </span>
          <h2>Nenhuma movimentação nesses dois meses</h2>
          <p>
            Assim que houver pedidos ou compras registradas, o
            relatório aparece aqui automaticamente.
          </p>
        </div>
      ) : (
        <>
          <div className="financeiro-kpis monthly-report__kpis">
            <article className="stat-card">
              <div className="stat-card__header">
                <span>Receita ({currentMonth.label})</span>
              </div>

              <strong>{reais(currentMonth.revenueCents)}</strong>

              {revenueGrowthPercent !== null && (
                <div
                  className={`monthly-report__growth${
                    revenueGrowthPercent >= 0
                      ? ""
                      : " monthly-report__growth--down"
                  }`}
                >
                  {revenueGrowthPercent >= 0 ? (
                    <TrendUp size={13} weight="bold" />
                  ) : (
                    <TrendDown size={13} weight="bold" />
                  )}
                  {Math.abs(revenueGrowthPercent).toFixed(1)}% vs.
                  mês anterior
                </div>
              )}
            </article>

            <article className="stat-card">
              <div className="stat-card__header">
                <span>Despesas (compras)</span>
              </div>

              <strong>{reais(currentMonth.purchasesCents)}</strong>

              <div className="stat-card__detail financeiro-stat__detail">
                {previousMonth.label}: {reais(previousMonth.purchasesCents)}
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-card__header">
                <span>Lucro estimado</span>

                <div className="stat-card__icon">
                  <ChartLineUp size={20} />
                </div>
              </div>

              <strong>{reais(currentMonth.profitCents)}</strong>

              <div className="stat-card__detail financeiro-stat__detail">
                Receita − despesas registradas
              </div>
            </article>
          </div>

          {topProducts.length > 0 && (
            <div className="financeiro-card">
              <h2>Produtos mais vendidos do mês</h2>

              <ul className="financeiro-breakdown">
                {topProducts.map((product) => (
                  <li key={product.name}>
                    <div>
                      <span>{product.name}</span>
                      <small>{product.quantity} unidade(s)</small>
                    </div>
                    <strong>{reais(product.totalCents)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
