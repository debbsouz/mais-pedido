"use client";

import {
  CheckCircle,
  ClockCountdown,
  CookingPot,
  Motorcycle,
} from "@phosphor-icons/react";

const operationStats = [
  {
    title: "Aguardando confirmação",
    value: "3",
    detail: "Pedido mais antigo há 6 min",
    icon: ClockCountdown,
  },
  {
    title: "Em preparo",
    value: "8",
    detail: "Tempo médio de 17 min",
    icon: CookingPot,
  },
  {
    title: "Pedidos prontos",
    value: "3",
    detail: "Aguardando retirada",
    icon: CheckCircle,
  },
  {
    title: "Entregas em rota",
    value: "2",
    detail: "1 aguardando entregador",
    icon: Motorcycle,
  },
];

export function OperationStats() {
  return (
    <section className="dashboard__stats">
      {operationStats.map((stat) => {
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
              {stat.detail}
            </div>
          </article>
        );
      })}
    </section>
  );
}