"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

import {
  formatCurrency,
  getPaymentLabel,
} from "@/lib/format";

import type { Order } from "./OrderCard";

import {
  OrderCustomerForm,
  type NewOrderCustomerData,
} from "./OrderCustomerForm";

import {
  OrderItemsForm,
  type NewOrderItem,
} from "./OrderItemsForm";

import {
  OrderPaymentForm,
  type NewOrderPaymentData,
} from "./OrderPaymentForm";

import {
  OrderTypeSelector,
  type NewOrderFulfillment,
  type NewOrderOrigin,
} from "./OrderTypeSelector";

interface NewOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (order: Order) => void;
}

const steps = [
  "Atendimento",
  "Cliente",
  "Produtos",
  "Pagamento",
  "Revisão",
];

const initialCustomer: NewOrderCustomerData = {
  name: "",
  phone: "",
  tableNumber: "",
  pickupName: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
};

const initialPayment: NewOrderPaymentData = {
  method: null,
  cardBrand: null,
  needsCardMachine: false,
  changeFor: "",
  observation: "",
};

export function NewOrderDrawer({
  isOpen,
  onClose,
  onCreateOrder,
}: NewOrderDrawerProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const [fulfillment, setFulfillment] =
    useState<NewOrderFulfillment | null>(null);

  const [origin, setOrigin] =
    useState<NewOrderOrigin | null>(null);

  const [customer, setCustomer] =
    useState<NewOrderCustomerData>(initialCustomer);

  const [items, setItems] =
    useState<NewOrderItem[]>([]);

  const [payment, setPayment] =
    useState<NewOrderPaymentData>(initialPayment);

  if (!isOpen) {
    return null;
  }

  const progress =
    ((currentStep + 1) / steps.length) * 100;

  const isFirstStep = currentStep === 0;
  const isLastStep =
    currentStep === steps.length - 1;

  const subtotal = items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  );

  const canContinueFromFirstStep =
    fulfillment !== null && origin !== null;

  function canContinueFromCustomerStep() {
    if (!fulfillment) {
      return false;
    }

    if (fulfillment === "Delivery") {
      return Boolean(
        customer.name.trim() &&
          customer.phone.trim() &&
          customer.street.trim() &&
          customer.number.trim() &&
          customer.neighborhood.trim() &&
          customer.city.trim(),
      );
    }

    if (fulfillment === "Retirada") {
      return Boolean(
        customer.name.trim() &&
          customer.phone.trim(),
      );
    }

    if (fulfillment === "Mesa") {
      return Boolean(
        customer.tableNumber.trim(),
      );
    }

    return Boolean(
      customer.name.trim() ||
        customer.pickupName.trim(),
    );
  }

  function canContinueFromPaymentStep() {
    if (!payment.method) {
      return false;
    }

    const isCard =
      payment.method === "Crédito" ||
      payment.method === "Débito";

    if (isCard && !payment.cardBrand) {
      return false;
    }

    if (
      payment.method === "Dinheiro" &&
      payment.changeFor
    ) {
      const changeAmount = Number(
        payment.changeFor
          .replace(/\./g, "")
          .replace(",", "."),
      );

      if (changeAmount < subtotal) {
        return false;
      }
    }

    return true;
  }

  const canContinue =
    currentStep === 0
      ? canContinueFromFirstStep
      : currentStep === 1
        ? canContinueFromCustomerStep()
        : currentStep === 2
          ? items.length > 0
          : currentStep === 3
            ? canContinueFromPaymentStep()
            : true;

  function resetDrawer() {
    setCurrentStep(0);
    setFulfillment(null);
    setOrigin(null);
    setCustomer(initialCustomer);
    setItems([]);
    setPayment(initialPayment);
  }

  function handleClose() {
    resetDrawer();
    onClose();
  }

  function goToPreviousStep() {
    setCurrentStep((step) =>
      Math.max(step - 1, 0),
    );
  }

  function goToNextStep() {
    if (!canContinue) {
      return;
    }

    setCurrentStep((step) =>
      Math.min(step + 1, steps.length - 1),
    );
  }

  function handleCreateOrder() {
    if (
      !fulfillment ||
      !origin ||
      !payment.method
    ) {
      return;
    }

    const orderId = Date.now()
      .toString()
      .slice(-6);

    const customerName =
      fulfillment === "Mesa"
        ? customer.name.trim() ||
          `Mesa ${customer.tableNumber}`
        : fulfillment === "Balcão"
          ? customer.name.trim() ||
            customer.pickupName.trim() ||
            "Cliente balcão"
          : customer.name.trim() || "Cliente";

    const itemsDescription = items
      .map(
        (item) =>
          `${item.quantity}x ${item.name}`,
      )
      .join(", ");

    const newOrder: Order = {
  id: orderId,
  number: 0,
  customer: customerName,
  origin,
  fulfillment,
  time: "agora",
  createdAt: Date.now(),
  total: formatCurrency(subtotal),
  items: itemsDescription,
  status: "new",
  delayed: false,

      phone: customer.phone || undefined,

      tableNumber:
        fulfillment === "Mesa"
          ? customer.tableNumber
          : undefined,

      pickupName:
        fulfillment === "Balcão"
          ? customer.pickupName
          : undefined,

      address:
        fulfillment === "Delivery"
          ? {
              zipCode: customer.zipCode,
              street: customer.street,
              number: customer.number,
              complement: customer.complement,
              neighborhood:
                customer.neighborhood,
              city: customer.city,
            }
          : undefined,

      itemDetails: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),

      payment: {
        method: payment.method,
        cardBrand: payment.cardBrand,
        needsCardMachine:
          payment.needsCardMachine,
        changeFor: payment.changeFor,
        observation: payment.observation,
      },
    };

    onCreateOrder(newOrder);
    resetDrawer();
  }

  function getCustomerLabel() {
    if (fulfillment === "Mesa") {
      return customer.name.trim()
        ? `${customer.name} · Mesa ${customer.tableNumber}`
        : `Mesa ${customer.tableNumber}`;
    }

    if (fulfillment === "Balcão") {
      return (
        customer.name ||
        customer.pickupName ||
        "Não informado"
      );
    }

    return customer.name || "Não informado";
  }

  return (
    <div className="new-order-drawer">
      <button
        type="button"
        className="new-order-drawer__backdrop"
        aria-label="Fechar novo pedido"
        onClick={handleClose}
      />

      <aside className="new-order-drawer__panel">
        <header className="new-order-drawer__header">
          <div>
            <span>Novo pedido</span>
            <h2>{steps[currentStep]}</h2>
          </div>

          <button
            type="button"
            className="new-order-drawer__close"
            onClick={handleClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="new-order-drawer__progress">
          <div className="new-order-drawer__steps">
            {steps.map((step, index) => {
              const isCompleted =
                index < currentStep;

              const isActive =
                index === currentStep;

              return (
                <div
                  key={step}
                  className={`new-order-step ${
                    isActive
                      ? "new-order-step--active"
                      : ""
                  } ${
                    isCompleted
                      ? "new-order-step--completed"
                      : ""
                  }`}
                >
                  <div className="new-order-step__number">
                    {isCompleted ? (
                      <Check
                        size={14}
                        weight="bold"
                      />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <span>{step}</span>
                </div>
              );
            })}
          </div>

          <div className="new-order-drawer__progress-track">
            <div
              className="new-order-drawer__progress-value"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <main className="new-order-drawer__content">
          {currentStep === 0 && (
            <OrderTypeSelector
              fulfillment={fulfillment}
              origin={origin}
              onFulfillmentChange={
                setFulfillment
              }
              onOriginChange={setOrigin}
            />
          )}

          {currentStep === 1 && (
            <OrderCustomerForm
              fulfillment={fulfillment}
              customer={customer}
              onChange={setCustomer}
            />
          )}

          {currentStep === 2 && (
            <OrderItemsForm
              items={items}
              onChange={setItems}
            />
          )}

          {currentStep === 3 && (
            <OrderPaymentForm
              fulfillment={fulfillment}
              payment={payment}
              total={subtotal}
              onChange={setPayment}
            />
          )}

          {currentStep === 4 && (
            <section className="new-order-review-preview">
              <span>Etapa 5</span>

              <h3>Revisar e criar pedido</h3>

              <div className="new-order-review-preview__item">
                <span>Atendimento</span>
                <strong>
                  {fulfillment ?? "Não informado"}
                </strong>
              </div>

              <div className="new-order-review-preview__item">
                <span>Origem</span>
                <strong>
                  {origin ?? "Não informada"}
                </strong>
              </div>

              <div className="new-order-review-preview__item">
                <span>
                  Cliente / identificação
                </span>

                <strong>
                  {getCustomerLabel()}
                </strong>
              </div>

              {customer.phone && (
                <div className="new-order-review-preview__item">
                  <span>Telefone</span>
                  <strong>
                    {customer.phone}
                  </strong>
                </div>
              )}

              {fulfillment ===
                "Delivery" && (
                <div className="new-order-review-preview__item">
                  <span>Endereço</span>

                  <strong>
                    {customer.street},{" "}
                    {customer.number} —{" "}
                    {customer.neighborhood}
                    {customer.complement
                      ? ` · ${customer.complement}`
                      : ""}
                  </strong>
                </div>
              )}

              <div className="new-order-review-preview__products">
                <span>Produtos</span>

                {items.map((item) => (
                  <div key={item.productId}>
                    <span>
                      {item.quantity}x{" "}
                      {item.name}
                    </span>

                    <strong>
                      {formatCurrency(
                        item.price *
                          item.quantity,
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="new-order-review-preview__item">
                <span>Pagamento</span>

                <strong>
                  {getPaymentLabel(payment)}
                </strong>
              </div>

              {payment.needsCardMachine && (
                <div className="new-order-review-preview__item">
                  <span>Maquininha</span>
                  <strong>
                    Levar na entrega
                  </strong>
                </div>
              )}

              {payment.changeFor && (
                <div className="new-order-review-preview__item">
                  <span>Troco para</span>
                  <strong>
                    R$ {payment.changeFor}
                  </strong>
                </div>
              )}

              {payment.observation && (
                <div className="new-order-review-preview__item">
                  <span>Observação</span>
                  <strong>
                    {payment.observation}
                  </strong>
                </div>
              )}

              <div className="new-order-review-preview__item">
                <span>Total</span>
                <strong>
                  {formatCurrency(subtotal)}
                </strong>
              </div>
            </section>
          )}
        </main>

        <footer className="new-order-drawer__footer">
          <button
            type="button"
            className="new-order-drawer__secondary"
            onClick={
              isFirstStep
                ? handleClose
                : goToPreviousStep
            }
          >
            {isFirstStep ? (
              "Cancelar"
            ) : (
              <>
                <ArrowLeft
                  size={17}
                  weight="bold"
                />
                Voltar
              </>
            )}
          </button>

          {isLastStep ? (
            <button
              type="button"
              className="new-order-drawer__primary"
              onClick={handleCreateOrder}
              disabled={!canContinue}
            >
              <Check
                size={18}
                weight="bold"
              />
              Criar pedido
            </button>
          ) : (
            <button
              type="button"
              className="new-order-drawer__primary"
              onClick={goToNextStep}
              disabled={!canContinue}
            >
              Continuar

              <ArrowRight
                size={17}
                weight="bold"
              />
            </button>
          )}
        </footer>
      </aside>
    </div>
  );
}