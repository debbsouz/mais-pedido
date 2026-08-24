"use client";

import { useState } from "react";

import {
  CaretLeft,
  Minus,
  Motorcycle,
  Plus,
  ShoppingCart,
  Storefront,
  X,
} from "@phosphor-icons/react";

import type {
  OrderFulfillment,
  StorefrontPaymentMethod,
  StorefrontPaymentMethodId,
} from "@/lib/storefront/types";

import { OrderTracker } from "./OrderTracker";
import { PaymentMethod } from "./PaymentMethod";

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  lines: CartLine[];
  paymentMethods: StorefrontPaymentMethod[];
  tableNumber?: string | null;
  onClose: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
}

type Step =
  | "cart"
  | "details"
  | "fulfillment"
  | "payment"
  | "confirmation";

const stepOrder: Step[] = [
  "cart",
  "details",
  "fulfillment",
  "payment",
  "confirmation",
];

const stepTitle: Record<Step, string> = {
  cart: "Seu carrinho",
  details: "Seus dados",
  fulfillment: "Entrega ou retirada",
  payment: "Forma de pagamento",
  confirmation: "Confirmação",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function CartDrawer({
  open,
  lines,
  paymentMethods,
  tableNumber = null,
  onClose,
  onIncrement,
  onDecrement,
}: CartDrawerProps) {
  const [step, setStep] = useState<Step>("cart");

  const [fulfillment, setFulfillment] =
    useState<OrderFulfillment>(
      tableNumber ? "dine-in" : "delivery",
    );

  const [payment, setPayment] =
    useState<StorefrontPaymentMethodId | null>(null);

  if (!open) {
    return null;
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  const isEmpty = lines.length === 0;
  const stepIndex = stepOrder.indexOf(step);

  function goNext() {
    const next = stepOrder[stepIndex + 1];
    if (next) setStep(next);
  }

  function goBack() {
    const prev = stepOrder[stepIndex - 1];
    if (prev) setStep(prev);
  }

  function handleClose() {
    setStep("cart");
    onClose();
  }

  return (
    <div className="cart-drawer">
      <button
        type="button"
        className="cart-drawer__backdrop"
        aria-label="Fechar carrinho"
        onClick={handleClose}
      />

      <aside className="cart-drawer__panel">
        <div className="cart-drawer__header">
          {!isEmpty && stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Voltar"
            >
              <CaretLeft size={20} />
            </button>
          ) : (
            <span className="cart-drawer__header-spacer" />
          )}

          <h2>{stepTitle[step]}</h2>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {!isEmpty && (
          <div className="cart-drawer__steps">
            {stepOrder.map((id, index) => (
              <span
                key={id}
                className="cart-drawer__step-dot"
                data-state={
                  index === stepIndex
                    ? "current"
                    : index < stepIndex
                      ? "done"
                      : "upcoming"
                }
              />
            ))}
          </div>
        )}

        <div className="cart-drawer__content">
          {isEmpty ? (
            <div className="cart-drawer__empty">
              <ShoppingCart
                size={32}
                weight="light"
              />
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : (
            <>
              {step === "cart" && (
                <section className="cart-drawer__section">
                  <div className="cart-drawer__lines">
                    {lines.map((line) => (
                      <div
                        key={line.productId}
                        className="cart-drawer__line"
                      >
                        <div>
                          <strong>{line.name}</strong>
                          <span>
                            {formatPrice(line.price)}
                          </span>
                        </div>

                        <div className="cart-drawer__line-stepper">
                          <button
                            type="button"
                            onClick={() =>
                              onDecrement(
                                line.productId,
                              )
                            }
                            aria-label={`Remover ${line.name}`}
                          >
                            <Minus
                              size={12}
                              weight="bold"
                            />
                          </button>

                          <span>{line.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              onIncrement(
                                line.productId,
                              )
                            }
                            aria-label={`Adicionar mais um ${line.name}`}
                          >
                            <Plus
                              size={12}
                              weight="bold"
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {step === "details" && (
                <section className="cart-drawer__section">
                  <div className="cart-drawer__field">
                    <input
                      type="text"
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="cart-drawer__field">
                    <input
                      type="tel"
                      placeholder="Telefone / WhatsApp"
                    />
                  </div>
                </section>
              )}

              {step === "fulfillment" && (
                <section className="cart-drawer__section">
                  {tableNumber ? (
                    <div className="storefront__table-badge">
                      Mesa {tableNumber}
                    </div>
                  ) : (
                    <>
                      <div className="cart-drawer__toggle">
                        <button
                          type="button"
                          onClick={() =>
                            setFulfillment("delivery")
                          }
                          className={
                            fulfillment === "delivery"
                              ? "is-active"
                              : ""
                          }
                        >
                          <Motorcycle
                            size={16}
                            weight="bold"
                          />
                          Entrega
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFulfillment("pickup")
                          }
                          className={
                            fulfillment === "pickup"
                              ? "is-active"
                              : ""
                          }
                        >
                          <Storefront
                            size={16}
                            weight="bold"
                          />
                          Retirada
                        </button>
                      </div>

                      {fulfillment === "delivery" && (
                        <div className="cart-drawer__field">
                          <input
                            type="text"
                            placeholder="Endereço de entrega"
                          />
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

              {step === "payment" && (
                <section className="cart-drawer__section">
                  <PaymentMethod
                    methods={paymentMethods}
                    selected={payment}
                    onSelect={setPayment}
                  />
                </section>
              )}

              {step === "confirmation" && (
                <section className="cart-drawer__section">
                  <p className="cart-drawer__confirmation-note">
                    Depois de confirmado, seu pedido passa
                    por estas etapas:
                  </p>

                  <OrderTracker
                    fulfillment={fulfillment}
                    tableNumber={tableNumber}
                  />
                </section>
              )}
            </>
          )}
        </div>

        {!isEmpty && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            {step === "confirmation" ? (
              <>
                <button
                  type="button"
                  className="cart-drawer__submit"
                  disabled
                >
                  Confirmar pedido
                </button>

                <small className="cart-drawer__note">
                  Pré-visualização — a finalização será
                  conectada assim que o backend estiver
                  pronto.
                </small>
              </>
            ) : (
              <button
                type="button"
                className="cart-drawer__submit"
                onClick={goNext}
              >
                Continuar
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
