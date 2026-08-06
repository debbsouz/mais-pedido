"use client";

import {
  Bank,
  CreditCard,
  Money,
  NotePencil,
  QrCode,
  Receipt,
} from "@phosphor-icons/react";

import type { NewOrderFulfillment } from "./OrderTypeSelector";

export type PaymentMethod =
  | "Pix"
  | "Dinheiro"
  | "Crédito"
  | "Débito"
  | "Comanda";

export type CardBrand =
  | "Visa"
  | "Mastercard"
  | "Elo"
  | "Hipercard";

export interface NewOrderPaymentData {
  method: PaymentMethod | null;
  cardBrand: CardBrand | null;
  needsCardMachine: boolean;
  changeFor: string;
  observation: string;
}

interface OrderPaymentFormProps {
  fulfillment: NewOrderFulfillment | null;
  payment: NewOrderPaymentData;
  total: number;
  onChange: (payment: NewOrderPaymentData) => void;
}

/*
 * Depois, estes dados virão das configurações
 * específicas de cada estabelecimento.
 */
const enabledPaymentMethods: PaymentMethod[] = [
  "Pix",
  "Dinheiro",
  "Crédito",
  "Débito",
  "Comanda",
];

const enabledCreditBrands: CardBrand[] = [
  "Visa",
  "Mastercard",
  "Elo",
  "Hipercard",
];

const enabledDebitBrands: CardBrand[] = [
  "Visa",
  "Mastercard",
  "Elo",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function formatMoneyInput(value: string) {
  const numbers = onlyNumbers(value).slice(0, 9);

  if (!numbers) {
    return "";
  }

  const amount = Number(numbers) / 100;

  return amount.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPaymentIcon(method: PaymentMethod) {
  if (method === "Pix") {
    return QrCode;
  }

  if (method === "Dinheiro") {
    return Money;
  }

  if (method === "Comanda") {
    return Receipt;
  }

  return CreditCard;
}

function getPaymentDescription(
  method: PaymentMethod,
  fulfillment: NewOrderFulfillment | null,
) {
  if (method === "Pix") {
    return "Pagamento por QR Code ou Pix copia e cola";
  }

  if (method === "Dinheiro") {
    return fulfillment === "Delivery"
      ? "Pagamento em dinheiro na entrega"
      : "Pagamento em dinheiro no estabelecimento";
  }

  if (method === "Crédito") {
    return fulfillment === "Delivery"
      ? "Cartão de crédito na entrega"
      : "Cartão de crédito presencial";
  }

  if (method === "Débito") {
    return fulfillment === "Delivery"
      ? "Cartão de débito na entrega"
      : "Cartão de débito presencial";
  }

  return "Adicionar o valor à comanda da mesa";
}

export function OrderPaymentForm({
  fulfillment,
  payment,
  total,
  onChange,
}: OrderPaymentFormProps) {
  const availableMethods = enabledPaymentMethods.filter(
    (method) =>
      method !== "Comanda" || fulfillment === "Mesa",
  );

  const availableBrands =
    payment.method === "Crédito"
      ? enabledCreditBrands
      : enabledDebitBrands;

  const isCard =
    payment.method === "Crédito" ||
    payment.method === "Débito";

  const changeAmount = payment.changeFor
    ? Number(
        payment.changeFor
          .replace(/\./g, "")
          .replace(",", "."),
      )
    : 0;

  const changeValue =
    changeAmount > total ? changeAmount - total : 0;

  function updatePayment(
    values: Partial<NewOrderPaymentData>,
  ) {
    onChange({
      ...payment,
      ...values,
    });
  }

  function selectMethod(method: PaymentMethod) {
    const cardMethod =
      method === "Crédito" || method === "Débito";

    updatePayment({
      method,
      cardBrand: null,
      needsCardMachine:
        cardMethod && fulfillment === "Delivery",
      changeFor:
        method === "Dinheiro"
          ? payment.changeFor
          : "",
    });
  }

  return (
    <div className="order-payment-form">
      <div className="order-payment-form__heading">
        <span>Pagamento</span>

        <h3>Como o pedido será pago?</h3>

        <p>
          Mostramos apenas as formas de pagamento
          habilitadas pelo estabelecimento.
        </p>
      </div>

      <section className="order-payment-total">
        <div>
          <Bank size={22} weight="fill" />
          <span>Total do pedido</span>
        </div>

        <strong>{formatCurrency(total)}</strong>
      </section>

      <div className="order-payment-methods">
        {availableMethods.map((method) => {
          const Icon = getPaymentIcon(method);
          const isSelected = payment.method === method;

          return (
            <button
              key={method}
              type="button"
              className={
                isSelected
                  ? "order-payment-option order-payment-option--selected"
                  : "order-payment-option"
              }
              onClick={() => selectMethod(method)}
            >
              <span className="order-payment-option__icon">
                <Icon
                  size={23}
                  weight={isSelected ? "fill" : "regular"}
                />
              </span>

              <span className="order-payment-option__content">
                <strong>{method}</strong>

                <small>
                  {getPaymentDescription(
                    method,
                    fulfillment,
                  )}
                </small>
              </span>

              <span className="order-payment-option__radio">
                <span />
              </span>
            </button>
          );
        })}
      </div>

      {isCard && (
        <section className="order-payment-details">
          <div className="order-payment-details__heading">
            <CreditCard size={20} />

            <div>
              <strong>Bandeira do cartão</strong>

              <span>
                Selecione uma bandeira aceita pelo
                estabelecimento.
              </span>
            </div>
          </div>

          <div className="order-card-brands">
            {availableBrands.map((brand) => (
              <button
                key={brand}
                type="button"
                className={
                  payment.cardBrand === brand
                    ? "order-card-brand order-card-brand--selected"
                    : "order-card-brand"
                }
                onClick={() =>
                  updatePayment({
                    cardBrand: brand,
                  })
                }
              >
                {brand}
              </button>
            ))}
          </div>

          {fulfillment === "Delivery" && (
            <div className="order-machine-option">
              <CreditCard size={18} weight="fill" />

              <span>
                <strong>Levar maquininha</strong>

                <small>
                  Obrigatório para pagamentos com cartão
                  na entrega.
                </small>
              </span>
            </div>
          )}
        </section>
      )}

      {payment.method === "Dinheiro" && (
        <section className="order-payment-details">
          <div className="order-payment-details__heading">
            <Money size={20} />

            <div>
              <strong>Troco</strong>

              <span>
                Deixe vazio caso o cliente não precise de
                troco.
              </span>
            </div>
          </div>

          <div className="order-form-field">
            <label htmlFor="change-for">
              Troco para
              <span>Opcional</span>
            </label>

            <div className="order-form-control">
              <span>R$</span>

              <input
                id="change-for"
                type="text"
                inputMode="numeric"
                value={payment.changeFor}
                onChange={(event) =>
                  updatePayment({
                    changeFor: formatMoneyInput(
                      event.target.value,
                    ),
                  })
                }
                placeholder="0,00"
                maxLength={12}
              />
            </div>
          </div>

          {changeAmount > 0 &&
            changeAmount < total && (
              <p className="order-payment-error">
                O valor informado é menor que o total do
                pedido.
              </p>
            )}

          {changeValue > 0 && (
            <div className="order-change-summary">
              <span>Troco necessário</span>

              <strong>
                {formatCurrency(changeValue)}
              </strong>
            </div>
          )}
        </section>
      )}

      {payment.method === "Pix" && (
        <section className="order-payment-info">
          <QrCode size={21} weight="fill" />

          <div>
            <strong>Pagamento via Pix</strong>

            <span>
              Futuramente o sistema exibirá o QR Code e
              fará a confirmação automática.
            </span>
          </div>
        </section>
      )}

      {payment.method === "Comanda" && (
        <section className="order-payment-info">
          <Receipt size={21} weight="fill" />

          <div>
            <strong>Lançar na comanda</strong>

            <span>
              O pagamento será realizado no fechamento da
              mesa.
            </span>
          </div>
        </section>
      )}

      <div className="order-form-field">
        <label htmlFor="payment-observation">
          Observação do pagamento
          <span>Opcional</span>
        </label>

        <div className="order-payment-textarea">
          <NotePencil size={19} />

          <textarea
            id="payment-observation"
            value={payment.observation}
            onChange={(event) =>
              updatePayment({
                observation: event.target.value.slice(
                  0,
                  200,
                ),
              })
            }
            placeholder="Ex.: cobrar na entrega, cartão por aproximação..."
            maxLength={200}
          />
        </div>
      </div>
    </div>
  );
}