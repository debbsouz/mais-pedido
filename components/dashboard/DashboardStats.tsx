"use client";

import {
  ArrowUpRight,
  Clock,
  CurrencyDollar,
  ForkKnife,
  Receipt,
} from "@phosphor-icons/react";

const statistics = [
  {
    title: "Vendas de hoje",
    value: "R$ 2.450,00",
    detail: "18% acima de ontem",
    icon: CurrencyDollar,
  },
  {
    title: "Pedidos",
    value: "58",
    detail: "12 em andamento",
    icon: Receipt,
  },
  {
    title: "Ticket médio",
    value: "R$ 42,24",
    detail: "R$ 3,80 acima da média",
    icon: ForkKnife,
  },
  {
    title: "Tempo médio",
    value: "18 min",
    detail: "2 minutos mais rápido",
    icon: Clock,
  },
];

export function DashboardStats() {
  return (
    <section className="dashboard__stats">
      {statistics.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.title} className="stat-card">
            <div className="stat-card__header">
              <span>{stat.title}</span>

              <div className="stat-card__icon">
                <Icon size={22} />
              </div>
            </div>

            <strong>{stat.value}</strong>

            <div className="stat-card__detail">
              <ArrowUpRight size={15} weight="bold" />
              {stat.detail}
            </div>
          </article>
        );
      })}
    </section>
  );
}