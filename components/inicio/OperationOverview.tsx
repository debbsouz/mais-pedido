"use client";

import {
  CheckCircle,
  ClockCountdown,
  CookingPot,
  Motorcycle,
  Plus,
  Receipt,
  Table,
  WarningCircle,
} from "@phosphor-icons/react";

const operationItems = [
  {
    label: "Aguardando confirmação",
    value: 3,
    detail: "Mais antigo há 6 min",
    icon: ClockCountdown,
    className: "operation-overview__item--warning",
  },
  {
    label: "Em preparo",
    value: 8,
    detail: "Tempo médio de 17 min",
    icon: CookingPot,
    className: "operation-overview__item--preparing",
  },
  {
    label: "Prontos",
    value: 3,
    detail: "Aguardando retirada",
    icon: CheckCircle,
    className: "operation-overview__item--success",
  },
  {
    label: "Entregas em rota",
    value: 2,
    detail: "1 aguardando entregador",
    icon: Motorcycle,
    className: "operation-overview__item--delivery",
  },
];

const quickActions = [
  {
    label: "Novo pedido",
    description: "Delivery, balcão ou WhatsApp",
    icon: Plus,
  },
  {
    label: "Abrir mesa",
    description: "Iniciar atendimento no salão",
    icon: Table,
  },
  {
    label: "Ver cozinha",
    description: "Acompanhar produção",
    icon: CookingPot,
  },
  {
    label: "Consultar pedidos",
    description: "Visualizar toda a operação",
    icon: Receipt,
  },
];

export function OperationOverview() {
  return (
    <>
      <section className="operation-health">
        <div className="operation-health__status">
          <div className="operation-health__icon">
            <CheckCircle size={28} weight="fill" />
          </div>

          <div>
            <span>Saúde da operação</span>
            <h2>Operação funcionando normalmente</h2>
            <p>Nenhum problema crítico identificado neste momento.</p>
          </div>
        </div>

        <div className="operation-health__metrics">
          <div>
            <span>Fila atual</span>
            <strong>14 pedidos</strong>
          </div>

          <div>
            <span>Tempo médio</span>
            <strong>17 minutos</strong>
          </div>

          <div>
            <span>Mesas ocupadas</span>
            <strong>4 de 12</strong>
          </div>

          <div>
            <span>Capacidade</span>
            <strong>72%</strong>
          </div>
        </div>
      </section>

      <section className="operation-overview">
        <div className="operation-section-heading">
          <div>
            <span>Agora</span>
            <h2>Fluxo da operação</h2>
            <p>Acompanhe cada etapa dos pedidos em tempo real.</p>
          </div>

          <button type="button">
            Ver todos os pedidos
          </button>
        </div>

        <div className="operation-overview__grid">
          {operationItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className={`operation-overview__item ${item.className}`}
              >
                <div className="operation-overview__item-header">
                  <div className="operation-overview__item-icon">
                    <Icon size={22} weight="fill" />
                  </div>

                  <strong>{item.value}</strong>
                </div>

                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="operation-quick-actions">
        <div className="operation-section-heading">
          <div>
            <span>Acesso rápido</span>
            <h2>O que você precisa fazer?</h2>
            <p>Atalhos para as principais ações do restaurante.</p>
          </div>
        </div>

        <div className="operation-quick-actions__grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                className={
                  index === 0
                    ? "operation-quick-action operation-quick-action--primary"
                    : "operation-quick-action"
                }
              >
                <div className="operation-quick-action__icon">
                  <Icon size={23} weight="bold" />
                </div>

                <div>
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="operation-warning">
        <WarningCircle size={22} weight="fill" />

        <div>
          <strong>3 pedidos precisam de confirmação</strong>
          <span>O mais antigo está aguardando há 6 minutos.</span>
        </div>

        <button type="button">
          Conferir agora
        </button>
      </section>
    </>
  );
}