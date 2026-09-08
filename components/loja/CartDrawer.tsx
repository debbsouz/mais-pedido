"use client";

import { useState } from "react";

import {
  CaretLeft,
  Check,
  Minus,
  Motorcycle,
  Plus,
  ShoppingCart,
  Storefront,
  X,
} from "@phosphor-icons/react";

import {
  checkPublicCoupon,
  createPublicOrder,
} from "@/app/actions/public-orders";
import { rememberOrderId } from "@/lib/storefront/order-history";
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
  organizationId: string;
  lines: CartLine[];
  paymentMethods: StorefrontPaymentMethod[];
  tableNumber?: string | null;
  onClose: () => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onOrderPlaced: () => void;
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
  organizationId,
  lines,
  paymentMethods,
  tableNumber = null,
  onClose,
  onIncrement,
  onDecrement,
  onOrderPlaced,
}: CartDrawerProps) {
  const [step, setStep] = useState<Step>("cart");

  const [fulfillment, setFulfillment] =
    useState<OrderFulfillment>(
      tableNumber ? "dine-in" : "delivery",
    );

  const [payment, setPayment] =
    useState<StorefrontPaymentMethodId | null>(null);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [address, setAddress] = useState({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
  });

  function updateAddressField(
    field: keyof typeof address,
    value: string,
  ) {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [placedOrderId, setPlacedOrderId] =
    useState<string | null>(null);

  const [couponCode, setCouponCode] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState<{
      code: string;
      discountCents: number;
    } | null>(null);

  const [couponMessage, setCouponMessage] =
    useState<string | null>(null);

  const [isCheckingCoupon, setIsCheckingCoupon] =
    useState(false);

  if (!open) {
    return null;
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  const discount = appliedCoupon
    ? appliedCoupon.discountCents / 100
    : 0;

  const total = Math.max(0, subtotal - discount);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      return;
    }

    setIsCheckingCoupon(true);
    setCouponMessage(null);

    const result = await checkPublicCoupon(
      organizationId,
      couponCode,
      Math.round(subtotal * 100),
    );

    setIsCheckingCoupon(false);

    if (!result.valid) {
      setAppliedCoupon(null);
      setCouponMessage(result.errorMessage);
      return;
    }

    setAppliedCoupon({
      code: couponCode.trim().toUpperCase(),
      discountCents: result.discountCents,
    });
    setCouponMessage("Cupom aplicado!");
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage(null);
  }

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

  function resetAndClose() {
    setStep("cart");
    setCustomerName("");
    setCustomerPhone("");
    setAddress({
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
    });
    setPayment(null);
    setSubmitError(null);
    setPlacedOrderId(null);
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponMessage(null);
    onClose();
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await createPublicOrder({
      organizationId,
      customerName,
      customerPhone: customerPhone || undefined,
      fulfillment,
      tableNumber: tableNumber ?? undefined,
      address:
        fulfillment === "delivery"
          ? address
          : undefined,
      paymentMethod: payment ?? undefined,
      items: lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        quantity: line.quantity,
      })),
      couponCode: appliedCoupon?.code,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    const newOrderId = result.data?.id ?? null;
    setPlacedOrderId(newOrderId);

    if (newOrderId) {
      rememberOrderId(organizationId, newOrderId);
    }

    onOrderPlaced();
  }

  const canContinueFromDetails =
    step !== "details" || customerName.trim().length > 0;

  const canContinueFromFulfillment =
    step !== "fulfillment" ||
    fulfillment !== "delivery" ||
    Boolean(
      address.street.trim() &&
        address.number.trim() &&
        address.neighborhood.trim(),
    );

  const canContinue =
    canContinueFromDetails && canContinueFromFulfillment;

  return (
    <div className="cart-drawer">
      <button
        type="button"
        className="cart-drawer__backdrop"
        aria-label="Fechar carrinho"
        onClick={resetAndClose}
      />

      <aside className="cart-drawer__panel">
        <div className="cart-drawer__header">
          {!isEmpty &&
          stepIndex > 0 &&
          !placedOrderId ? (
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

          <h2>
            {placedOrderId
              ? "Pedido enviado"
              : stepTitle[step]}
          </h2>

          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {!isEmpty && !placedOrderId && (
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
          {placedOrderId ? (
            <section className="cart-drawer__section">
              <div className="cart-drawer__success">
                <Check
                  size={28}
                  weight="bold"
                />
                <strong>
                  Pedido enviado com sucesso!
                </strong>
                <p>
                  O estabelecimento já recebeu seu
                  pedido.
                </p>
              </div>

              <OrderTracker
                fulfillment={fulfillment}
                currentStep="received"
                tableNumber={tableNumber}
              />
            </section>
          ) : isEmpty ? (
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

                  <div className="cart-drawer__coupon">
                    {appliedCoupon ? (
                      <div className="cart-drawer__coupon-applied">
                        <span>
                          Cupom{" "}
                          <strong>
                            {appliedCoupon.code}
                          </strong>{" "}
                          aplicado: -
                          {formatPrice(discount)}
                        </span>

                        <button
                          type="button"
                          onClick={
                            handleRemoveCoupon
                          }
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="cart-drawer__coupon-input">
                        <input
                          type="text"
                          placeholder="Cupom de desconto"
                          value={couponCode}
                          onChange={(event) =>
                            setCouponCode(
                              event.target.value,
                            )
                          }
                        />

                        <button
                          type="button"
                          disabled={
                            isCheckingCoupon ||
                            !couponCode.trim()
                          }
                          onClick={
                            handleApplyCoupon
                          }
                        >
                          {isCheckingCoupon
                            ? "..."
                            : "Aplicar"}
                        </button>
                      </div>
                    )}

                    {couponMessage && (
                      <small
                        className={
                          appliedCoupon
                            ? "cart-drawer__coupon-message cart-drawer__coupon-message--ok"
                            : "cart-drawer__coupon-message"
                        }
                      >
                        {couponMessage}
                      </small>
                    )}
                  </div>
                </section>
              )}

              {step === "details" && (
                <section className="cart-drawer__section">
                  <div className="cart-drawer__field">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="cart-drawer__field">
                    <input
                      type="tel"
                      placeholder="Telefone / WhatsApp"
                      value={customerPhone}
                      onChange={(event) =>
                        setCustomerPhone(
                          event.target.value,
                        )
                      }
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
                        <div className="cart-drawer__address">
                          <div className="cart-drawer__field">
                            <input
                              type="text"
                              placeholder="CEP (opcional)"
                              value={address.zipCode}
                              onChange={(event) =>
                                updateAddressField(
                                  "zipCode",
                                  event.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="cart-drawer__address-row">
                            <div className="cart-drawer__field">
                              <input
                                type="text"
                                placeholder="Rua"
                                value={address.street}
                                onChange={(event) =>
                                  updateAddressField(
                                    "street",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="cart-drawer__field cart-drawer__field--small">
                              <input
                                type="text"
                                placeholder="Nº"
                                value={address.number}
                                onChange={(event) =>
                                  updateAddressField(
                                    "number",
                                    event.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="cart-drawer__field">
                            <input
                              type="text"
                              placeholder="Bairro"
                              value={
                                address.neighborhood
                              }
                              onChange={(event) =>
                                updateAddressField(
                                  "neighborhood",
                                  event.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="cart-drawer__field">
                            <input
                              type="text"
                              placeholder="Complemento (opcional)"
                              value={
                                address.complement
                              }
                              onChange={(event) =>
                                updateAddressField(
                                  "complement",
                                  event.target.value,
                                )
                              }
                            />
                          </div>
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

                  {submitError && (
                    <p className="cart-drawer__error">
                      {submitError}
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        {!isEmpty && !placedOrderId && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>

              <div className="cart-drawer__total-value">
                {appliedCoupon && (
                  <small className="cart-drawer__total-original">
                    {formatPrice(subtotal)}
                  </small>
                )}

                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            {step === "confirmation" ? (
              <button
                type="button"
                className="cart-drawer__submit"
                disabled={isSubmitting}
                onClick={handleConfirm}
              >
                {isSubmitting
                  ? "Enviando..."
                  : "Confirmar pedido"}
              </button>
            ) : (
              <button
                type="button"
                className="cart-drawer__submit"
                disabled={!canContinue}
                onClick={goNext}
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {placedOrderId && (
          <div className="cart-drawer__footer">
            <button
              type="button"
              className="cart-drawer__submit"
              onClick={resetAndClose}
            >
              Fechar
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
