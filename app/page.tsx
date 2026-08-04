"use client";
import {
  ArrowUpRight,
  Clock,
  CurrencyDollar,
  ForkKnife,
  Receipt,
  WarningCircle,
} from "@phosphor-icons/react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

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

export default function Home() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__main">
        <Topbar />

        <main className="dashboard">
          <section className="dashboard__heading">
            <div>
              <span className="dashboard__eyebrow">
                Terça-feira, 4 de agosto
              </span>

              <h1>Boa tarde, Débora!</h1>

              <p>
                Acompanhe tudo o que está acontecendo na Burger House.
              </p>
            </div>

            <button type="button" className="dashboard__primary-action">
              <span>+</span>
              Novo pedido
            </button>
          </section>

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

          <section className="dashboard__alert">
            <div className="dashboard__alert-icon">
              <WarningCircle size={24} weight="fill" />
            </div>

            <div>
              <strong>3 pedidos aguardando confirmação</strong>
              <p>O pedido mais antigo está esperando há 6 minutos.</p>
            </div>

            <button type="button">Ver pedidos</button>
          </section>

          <section className="dashboard__grid">
            <article className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2>Operação agora</h2>
                  <p>Resumo em tempo real</p>
                </div>

                <button type="button">Ver operação</button>
              </div>

              <div className="operation-list">
                <div>
                  <span className="operation-list__indicator operation-list__indicator--orange" />
                  <div>
                    <strong>8 pedidos em preparo</strong>
                    <span>Cozinha</span>
                  </div>
                  <b>8</b>
                </div>

                <div>
                  <span className="operation-list__indicator operation-list__indicator--green" />
                  <div>
                    <strong>3 pedidos prontos</strong>
                    <span>Aguardando retirada</span>
                  </div>
                  <b>3</b>
                </div>

                <div>
                  <span className="operation-list__indicator operation-list__indicator--blue" />
                  <div>
                    <strong>2 entregadores em rota</strong>
                    <span>Entregas</span>
                  </div>
                  <b>2</b>
                </div>

                <div>
                  <span className="operation-list__indicator operation-list__indicator--yellow" />
                  <div>
                    <strong>4 mesas ocupadas</strong>
                    <span>Salão</span>
                  </div>
                  <b>4</b>
                </div>
              </div>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card__header">
                <div>
                  <h2>Últimos pedidos</h2>
                  <p>Movimentação recente</p>
                </div>

                <button type="button">Ver todos</button>
              </div>

              <div className="recent-orders">
                <div>
                  <div>
                    <strong>#1048 · Mariana</strong>
                    <span>Delivery · 14:32</span>
                  </div>
                  <span className="status status--preparing">Em preparo</span>
                  <b>R$ 58,90</b>
                </div>

                <div>
                  <div>
                    <strong>#1047 · Mesa 08</strong>
                    <span>Garçom · 14:26</span>
                  </div>
                  <span className="status status--ready">Pronto</span>
                  <b>R$ 96,50</b>
                </div>

                <div>
                  <div>
                    <strong>#1046 · Carlos</strong>
                    <span>WhatsApp · 14:18</span>
                  </div>
                  <span className="status status--waiting">
                    Aguardando
                  </span>
                  <b>R$ 42,00</b>
                </div>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}