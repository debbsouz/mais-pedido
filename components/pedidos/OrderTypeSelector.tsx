"use client";

import {
  ChatCircleText,
  ComputerTower,
  ForkKnife,
  Motorcycle,
  Storefront,
  Table,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";

export type NewOrderFulfillment =
  | "Delivery"
  | "Retirada"
  | "Mesa"
  | "Balcão";

export type NewOrderOrigin =
  | "Site"
  | "WhatsApp"
  | "Garçom"
  | "Atendente";

interface OrderTypeSelectorProps {
  fulfillment: NewOrderFulfillment | null;
  origin: NewOrderOrigin | null;
  onFulfillmentChange: (
    fulfillment: NewOrderFulfillment,
  ) => void;
  onOriginChange: (origin: NewOrderOrigin) => void;
}

const fulfillmentOptions = [
  {
    value: "Delivery" as const,
    title: "Delivery",
    description: "Entrega no endereço do cliente",
    icon: Motorcycle,
  },
  {
    value: "Retirada" as const,
    title: "Retirada",
    description: "Cliente retira no estabelecimento",
    icon: Storefront,
  },
  {
    value: "Mesa" as const,
    title: "Mesa",
    description: "Consumo no salão do restaurante",
    icon: Table,
  },
  {
    value: "Balcão" as const,
    title: "Balcão",
    description: "Pedido rápido feito no caixa",
    icon: ForkKnife,
  },
];

const originOptions = [
  {
    value: "Site" as const,
    title: "Site",
    description: "Pedido recebido pelo cardápio digital",
    icon: ComputerTower,
  },
  {
    value: "WhatsApp" as const,
    title: "WhatsApp",
    description: "Pedido informado pelo WhatsApp",
    icon: ChatCircleText,
  },
  {
    value: "Garçom" as const,
    title: "Garçom",
    description: "Pedido lançado pela equipe do salão",
    icon: UsersThree,
  },
  {
    value: "Atendente" as const,
    title: "Atendente",
    description: "Pedido lançado manualmente no painel",
    icon: UserCircle,
  },
];

export function OrderTypeSelector({
  fulfillment,
  origin,
  onFulfillmentChange,
  onOriginChange,
}: OrderTypeSelectorProps) {
  return (
    <div className="order-type-selector">
      <section className="order-type-selector__section">
        <div className="order-type-selector__heading">
          <span>Tipo de atendimento</span>
          <h3>Como o cliente receberá o pedido?</h3>
          <p>
            Essa escolha define os dados necessários nas
            próximas etapas.
          </p>
        </div>

        <div className="order-type-selector__grid">
          {fulfillmentOptions.map((option) => {
            const Icon = option.icon;
            const isSelected =
              fulfillment === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`order-type-option ${
                  isSelected
                    ? "order-type-option--selected"
                    : ""
                }`}
                onClick={() =>
                  onFulfillmentChange(option.value)
                }
              >
                <span className="order-type-option__icon">
                  <Icon
                    size={23}
                    weight={
                      isSelected ? "fill" : "regular"
                    }
                  />
                </span>

                <span className="order-type-option__content">
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>

                <span className="order-type-option__radio">
                  <span />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="order-type-selector__section">
        <div className="order-type-selector__heading">
          <span>Origem do pedido</span>
          <h3>Por qual canal o pedido chegou?</h3>
          <p>
            Isso ajudará a medir quais canais geram mais
            pedidos.
          </p>
        </div>

        <div className="order-type-selector__grid">
          {originOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = origin === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`order-type-option ${
                  isSelected
                    ? "order-type-option--selected"
                    : ""
                }`}
                onClick={() =>
                  onOriginChange(option.value)
                }
              >
                <span className="order-type-option__icon">
                  <Icon
                    size={23}
                    weight={
                      isSelected ? "fill" : "regular"
                    }
                  />
                </span>

                <span className="order-type-option__content">
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>

                <span className="order-type-option__radio">
                  <span />
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}