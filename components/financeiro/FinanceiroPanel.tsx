"use client";

import {
  ChartBar,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";

import { formatCurrency } from "@/lib/format";
import type {
  BreakdownEntry,
  FinancialSummary,
  PeriodStats,
} from "@/lib/financeiro-dal";

interface FinanceiroPanelProps {
  summary: FinancialSummary | null;
}

function reais(cents: number) {
  return formatCurrency(cents / 100);
}

function dayLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
}

const periodCards: {
  key: keyof Pick<
    FinancialSummary,
    "today" | "last7Days" | "last30Days"
  >;
  title: string;
}[] = [
  { key: "today", title: "Hoje" },
  { key: "last7Days", title: "Últimos 7 dias" },
  { key: "last30Days", title: "Últimos 30 dias" },
];

function PeriodCard({
  title,
  stats,
}: {
  title: string;
  stats: PeriodStats;
}) {
  return (
    <article className="stat-card">
      <div className="stat-card__header">
        <span>{title}</span>

        <div className="stat-card__icon">
          <CurrencyCircleDollar size={20} />
        </div>
      </div>

      <strong>{reais(stats.totalCents)}</strong>

      <div className="stat-card__detail financeiro-stat__detail">
        {stats.orderCount === 0
          ? "Nenhum pedido"
          : `${stats.orderCount} pedido(s) · ticket médio ${reais(
              stats.averageTicketCents,
            )}`}
      </div>
    </article>
  );
}

function BreakdownList({
  entries,
}: {
  entries: BreakdownEntry[];
}) {
  return (
    <ul className="financeiro-breakdown">
      {entries.map((entry) => (
        <li key={entry.label}>
          <div>
            <span>{entry.label}</span>
            <small>{entry.orderCount} pedido(s)</small>
          </div>
          <strong>{reais(entry.totalCents)}</strong>
        </li>
      ))}
    </ul>
  );
}

export function FinanceiroPanel({
  summary,
}: FinanceiroPanelProps) {
  return (
    <>
      <header className="financeiro-header">
        <div>
          <span className="financeiro-header__eyebrow">
            <CurrencyCircleDollar size={16} weight="bold" />
            Gestão financeira
          </span>

          <h1>Financeiro</h1>

          <p>
            Receita real dos seus pedidos, calculada direto do
            banco. Pedidos cancelados não entram na conta.
          </p>
        </div>
      </header>

      {summary && (
        <>
          <section className="financeiro-kpis">
            {periodCards.map((card) => (
              <PeriodCard
                key={card.key}
                title={card.title}
                stats={summary[card.key]}
              />
            ))}
          </section>

          {summary.last30Days.orderCount === 0 ? (
            <div className="financeiro-empty">
              <span>
                <ChartBar size={26} weight="bold" />
              </span>
              <h2>Nenhum pedido nos últimos 30 dias</h2>
              <p>
                Assim que novos pedidos entrarem, a receita
                aparece aqui automaticamente — nada nesta tela
                é inventado.
              </p>
            </div>
          ) : (
            <FinanceiroBreakdowns summary={summary} />
          )}
        </>
      )}
    </>
  );
}

function FinanceiroBreakdowns({
  summary,
}: {
  summary: FinancialSummary;
}) {
  const maxDaily = Math.max(
    1,
    ...summary.dailyRevenue.map((day) => day.totalCents),
  );

  return (
    <div className="financeiro-grid">
      <section className="financeiro-card financeiro-card--chart">
        <h2>Receita por dia (últimos 14 dias)</h2>

        <div className="financeiro-chart">
          {summary.dailyRevenue.map((day) => (
            <div
              key={day.date}
              className="financeiro-chart__bar-wrap"
              title={`${dayLabel(day.date)}: ${reais(
                day.totalCents,
              )}`}
            >
              <div
                className="financeiro-chart__bar"
                style={{
                  height: `${Math.max(
                    3,
                    (day.totalCents / maxDaily) * 100,
                  )}%`,
                }}
              />
              <span>{dayLabel(day.date)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="financeiro-card">
        <h2>Formas de pagamento</h2>
        <BreakdownList entries={summary.byPaymentMethod} />
      </section>

      <section className="financeiro-card">
        <h2>Origem dos pedidos</h2>
        <BreakdownList entries={summary.byOrigin} />
      </section>
    </div>
  );
}
