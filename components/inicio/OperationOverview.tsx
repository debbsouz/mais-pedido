"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

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

import { useOrders } from "@/components/providers/OrdersProvider";
import { useTables } from "@/components/providers/TablesProvider";
import {
  getElapsedMinutes,
  getOrderUrgency,
} from "@/lib/order-timing";

const quickActions = [
  {
    label: "Novo pedido",
    description: "Delivery, balcão ou WhatsApp",
    icon: Plus,
    href: "/pedidos",
  },
  {
    label: "Abrir mesa",
    description: "Iniciar atendimento no salão",
    icon: Table,
    href: "/mesas",
  },
  {
    label: "Ver cozinha",
    description: "Acompanhar produção",
    icon: CookingPot,
    href: "/cozinha",
  },
  {
    label: "Consultar pedidos",
    description: "Visualizar toda a operação",
    icon: Receipt,
    href: "/pedidos",
  },
];

export function OperationOverview() {
  const router = useRouter();
  const { orders } = useOrders();
  const { tables } = useTables();

  const [now, setNow] =
    useState<number | null>(null);

  useEffect(() => {
    const initialTimer =
      window.setTimeout(() => {
        setNow(Date.now());
      }, 0);

    const interval =
      window.setInterval(() => {
        setNow(Date.now());
      }, 60_000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  const newOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "new",
      ),
    [orders],
  );

  const preparingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "preparing",
      ),
    [orders],
  );

  const readyOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === "ready",
      ),
    [orders],
  );

  const deliveryOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "delivery" &&
          order.fulfillment === "Delivery",
      ),
    [orders],
  );

  const oldestNewMinutes = useMemo(() => {
    if (newOrders.length === 0) {
      return 0;
    }

    return Math.max(
      ...newOrders.map((order) =>
        getElapsedMinutes(
          now,
          order.createdAt,
          order.time,
        ),
      ),
    );
  }, [newOrders, now]);

  const averagePreparingMinutes = useMemo(() => {
    if (preparingOrders.length === 0) {
      return 0;
    }

    const total = preparingOrders.reduce(
      (sum, order) =>
        sum +
        getElapsedMinutes(
          now,
          order.createdAt,
          order.time,
        ),
      0,
    );

    return Math.round(
      total / preparingOrders.length,
    );
  }, [preparingOrders, now]);

  const occupiedTables = useMemo(
    () =>
      tables.filter(
        (table) => table.status !== "free",
      ).length,
    [tables],
  );

  const capacityPercent =
    tables.length > 0
      ? Math.round(
          (occupiedTables / tables.length) *
            100,
        )
      : 0;

  const activeOrdersCount =
    newOrders.length +
    preparingOrders.length +
    readyOrders.length +
    deliveryOrders.length;

  /**
   * Saude da operacao: reaproveita a mesma regra de urgencia
   * ja usada na Cozinha (10min = atencao, 20min = critico),
   * olhando para pedidos aguardando confirmacao ou em preparo.
   */
  const actionableOrders = [
    ...newOrders,
    ...preparingOrders,
  ];

  const actionableUrgencies =
    actionableOrders.map((order) =>
      getOrderUrgency(
        getElapsedMinutes(
          now,
          order.createdAt,
          order.time,
        ),
      ),
    );

  const criticalCount =
    actionableUrgencies.filter(
      (urgency) => urgency === "critical",
    ).length;

  const warningCount =
    actionableUrgencies.filter(
      (urgency) => urgency === "warning",
    ).length;

  const operationHealth =
    criticalCount > 0
      ? "critical"
      : warningCount > 0
        ? "warning"
        : "normal";

  const healthContent = {
    normal: {
      icon: CheckCircle,
      title:
        "Operação funcionando normalmente",
      description:
        "Nenhum problema crítico identificado neste momento.",
    },
    warning: {
      icon: WarningCircle,
      title: "Operação exige atenção",
      description: `${warningCount} ${
        warningCount === 1
          ? "pedido está"
          : "pedidos estão"
      } aguardando há mais de 10 minutos.`,
    },
    critical: {
      icon: WarningCircle,
      title: "Operação com atraso crítico",
      description: `${criticalCount} ${
        criticalCount === 1
          ? "pedido está"
          : "pedidos estão"
      } esperando há mais de 20 minutos. Verifique agora.`,
    },
  }[operationHealth];

  const HealthIcon = healthContent.icon;

  const operationItems = [
    {
      label: "Aguardando confirmação",
      value: newOrders.length,
      detail:
        newOrders.length > 0
          ? `Mais antigo há ${oldestNewMinutes} min`
          : "Nenhum pedido novo",
      icon: ClockCountdown,
      className:
        "operation-overview__item--warning",
    },
    {
      label: "Em preparo",
      value: preparingOrders.length,
      detail:
        preparingOrders.length > 0
          ? `Tempo médio de ${averagePreparingMinutes} min`
          : "Nenhum pedido em preparo",
      icon: CookingPot,
      className:
        "operation-overview__item--preparing",
    },
    {
      label: "Prontos",
      value: readyOrders.length,
      detail:
        readyOrders.length > 0
          ? "Aguardando retirada"
          : "Nenhum pedido pronto",
      icon: CheckCircle,
      className:
        "operation-overview__item--success",
    },
    {
      label: "Entregas em rota",
      value: deliveryOrders.length,
      detail:
        deliveryOrders.length > 0
          ? "Acompanhe em Entregas"
          : "Nenhuma entrega em rota",
      icon: Motorcycle,
      className:
        "operation-overview__item--delivery",
    },
  ];

  return (
    <>
      <section
        className={
          operationHealth === "normal"
            ? "operation-health"
            : `operation-health operation-health--${operationHealth}`
        }
      >
        <div className="operation-health__status">
          <div className="operation-health__icon">
            <HealthIcon size={28} weight="fill" />
          </div>

          <div>
            <span>Saúde da operação</span>
            <h2>{healthContent.title}</h2>
            <p>{healthContent.description}</p>
          </div>
        </div>

        <div className="operation-health__metrics">
          <div>
            <span>Fila atual</span>
            <strong>
              {activeOrdersCount}{" "}
              {activeOrdersCount === 1
                ? "pedido"
                : "pedidos"}
            </strong>
          </div>

          <div>
            <span>Tempo médio</span>
            <strong>
              {preparingOrders.length > 0
                ? `${averagePreparingMinutes} minutos`
                : "—"}
            </strong>
          </div>

          <div>
            <span>Mesas ocupadas</span>
            <strong>
              {occupiedTables} de{" "}
              {tables.length}
            </strong>
          </div>

          <div>
            <span>Capacidade</span>
            <strong>{capacityPercent}%</strong>
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

          <button
            type="button"
            onClick={() => router.push("/pedidos")}
          >
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
                onClick={() =>
                  router.push(action.href)
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

      {newOrders.length > 0 && (
        <section className="operation-warning">
          <WarningCircle size={22} weight="fill" />

          <div>
            <strong>
              {newOrders.length}{" "}
              {newOrders.length === 1
                ? "pedido precisa"
                : "pedidos precisam"}{" "}
              de confirmação
            </strong>

            <span>
              O mais antigo está aguardando há{" "}
              {oldestNewMinutes} minutos.
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/pedidos")}
          >
            Conferir agora
          </button>
        </section>
      )}
    </>
  );
}
