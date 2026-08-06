"use client";

import {
  Hash,
  House,
  MapPin,
  Phone,
  User,
} from "@phosphor-icons/react";

import type { NewOrderFulfillment } from "./OrderTypeSelector";

export interface NewOrderCustomerData {
  name: string;
  phone: string;
  tableNumber: string;
  pickupName: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
}

interface OrderCustomerFormProps {
  fulfillment: NewOrderFulfillment | null;
  customer: NewOrderCustomerData;
  onChange: (customer: NewOrderCustomerData) => void;
}

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (numbers.length <= 2) {
    return numbers ? `(${numbers}` : "";
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      6,
    )}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(
    2,
    7,
  )}-${numbers.slice(7)}`;
}

function formatZipCode(value: string) {
  const numbers = onlyNumbers(value).slice(0, 8);

  if (numbers.length <= 5) {
    return numbers;
  }

  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
}

export function OrderCustomerForm({
  fulfillment,
  customer,
  onChange,
}: OrderCustomerFormProps) {
  function updateField(
    field: keyof NewOrderCustomerData,
    value: string,
  ) {
    onChange({
      ...customer,
      [field]: value,
    });
  }

  return (
    <div className="order-customer-form">
      <div className="order-customer-form__heading">
        <span>Dados do atendimento</span>

        <h3>
          {fulfillment === "Delivery" &&
            "Para onde enviaremos o pedido?"}

          {fulfillment === "Retirada" &&
            "Quem retirará o pedido?"}

          {fulfillment === "Mesa" &&
            "Em qual mesa será o atendimento?"}

          {fulfillment === "Balcão" &&
            "Como identificaremos o pedido?"}
        </h3>

        <p>
          Preencha apenas as informações necessárias para
          este tipo de atendimento.
        </p>
      </div>

      {fulfillment !== "Mesa" && (
        <div className="order-form-field">
          <label htmlFor="customer-name">
            Nome do cliente
          </label>

          <div className="order-form-control">
            <User size={19} />

            <input
              id="customer-name"
              type="text"
              value={customer.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder="Digite o nome do cliente"
              maxLength={80}
            />
          </div>
        </div>
      )}

      {(fulfillment === "Delivery" ||
        fulfillment === "Retirada") && (
        <div className="order-form-field">
          <label htmlFor="customer-phone">
            Telefone
          </label>

          <div className="order-form-control">
            <Phone size={19} />

            <input
              id="customer-phone"
              type="tel"
              inputMode="numeric"
              value={customer.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  formatPhone(event.target.value),
                )
              }
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>
        </div>
      )}

      {fulfillment === "Mesa" && (
        <>
          <div className="order-form-field">
            <label htmlFor="table-number">
              Número da mesa
            </label>

            <div className="order-form-control">
              <Hash size={19} />

              <input
                id="table-number"
                type="text"
                inputMode="numeric"
                value={customer.tableNumber}
                onChange={(event) =>
                  updateField(
                    "tableNumber",
                    onlyNumbers(event.target.value).slice(
                      0,
                      3,
                    ),
                  )
                }
                placeholder="Ex.: 08"
                maxLength={3}
              />
            </div>
          </div>

          <div className="order-form-field">
            <label htmlFor="table-customer">
              Nome do cliente
              <span>Opcional</span>
            </label>

            <div className="order-form-control">
              <User size={19} />

              <input
                id="table-customer"
                type="text"
                value={customer.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Nome para identificar a comanda"
                maxLength={80}
              />
            </div>
          </div>
        </>
      )}

      {fulfillment === "Balcão" && (
        <div className="order-form-field">
          <label htmlFor="pickup-name">
            Nome ou senha de retirada
          </label>

          <div className="order-form-control">
            <Hash size={19} />

            <input
              id="pickup-name"
              type="text"
              value={customer.pickupName}
              onChange={(event) =>
                updateField(
                  "pickupName",
                  event.target.value.slice(0, 30),
                )
              }
              placeholder="Ex.: João ou senha 42"
              maxLength={30}
            />
          </div>
        </div>
      )}

      {fulfillment === "Delivery" && (
        <section className="order-address-form">
          <div className="order-address-form__title">
            <MapPin size={20} />

            <div>
              <strong>Endereço de entrega</strong>
              <span>
                Confira os dados antes de continuar.
              </span>
            </div>
          </div>

          <div className="order-address-form__grid">
            <div className="order-form-field">
              <label htmlFor="zip-code">CEP</label>

              <div className="order-form-control">
                <MapPin size={18} />

                <input
                  id="zip-code"
                  type="text"
                  inputMode="numeric"
                  value={customer.zipCode}
                  onChange={(event) =>
                    updateField(
                      "zipCode",
                      formatZipCode(event.target.value),
                    )
                  }
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>

            <div className="order-form-field order-form-field--wide">
              <label htmlFor="street">Rua</label>

              <div className="order-form-control">
                <House size={18} />

                <input
                  id="street"
                  type="text"
                  value={customer.street}
                  onChange={(event) =>
                    updateField(
                      "street",
                      event.target.value,
                    )
                  }
                  placeholder="Nome da rua"
                  maxLength={120}
                />
              </div>
            </div>

            <div className="order-form-field">
              <label htmlFor="address-number">
                Número
              </label>

              <div className="order-form-control">
                <Hash size={18} />

                <input
                  id="address-number"
                  type="text"
                  inputMode="numeric"
                  value={customer.number}
                  onChange={(event) =>
                    updateField(
                      "number",
                      onlyNumbers(
                        event.target.value,
                      ).slice(0, 8),
                    )
                  }
                  placeholder="123"
                  maxLength={8}
                />
              </div>
            </div>

            <div className="order-form-field">
              <label htmlFor="complement">
                Complemento
                <span>Opcional</span>
              </label>

              <div className="order-form-control">
                <House size={18} />

                <input
                  id="complement"
                  type="text"
                  value={customer.complement}
                  onChange={(event) =>
                    updateField(
                      "complement",
                      event.target.value,
                    )
                  }
                  placeholder="Casa, apto..."
                  maxLength={80}
                />
              </div>
            </div>

            <div className="order-form-field">
              <label htmlFor="neighborhood">
                Bairro
              </label>

              <div className="order-form-control">
                <MapPin size={18} />

                <input
                  id="neighborhood"
                  type="text"
                  value={customer.neighborhood}
                  onChange={(event) =>
                    updateField(
                      "neighborhood",
                      event.target.value,
                    )
                  }
                  placeholder="Bairro"
                  maxLength={80}
                />
              </div>
            </div>

            <div className="order-form-field">
              <label htmlFor="city">Cidade</label>

              <div className="order-form-control">
                <MapPin size={18} />

                <input
                  id="city"
                  type="text"
                  value={customer.city}
                  onChange={(event) =>
                    updateField(
                      "city",
                      event.target.value,
                    )
                  }
                  placeholder="Cidade"
                  maxLength={80}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}