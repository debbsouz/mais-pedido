"use client";

import {
  Check,
  MapPin,
  Phone,
  User,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

export interface CustomerFormData {
  id: string;
  name: string;
  phone: string;
  email: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  notes: string;
}

interface CustomerFormDrawerProps {
  open: boolean;
  customer?: CustomerFormData | null;
  onClose: () => void;
  onSave: (
    customer: CustomerFormData,
  ) => void;
}

interface CustomerFormContentProps {
  customer?: CustomerFormData | null;
  onClose: () => void;
  onSave: (
    customer: CustomerFormData,
  ) => void;
}

function CustomerFormContent({
  customer,
  onClose,
  onSave,
}: CustomerFormContentProps) {
  const [name, setName] =
    useState(customer?.name ?? "");

  const [phone, setPhone] =
    useState(customer?.phone ?? "");

  const [email, setEmail] =
    useState(customer?.email ?? "");

  const [zipCode, setZipCode] =
    useState(customer?.zipCode ?? "");

  const [street, setStreet] =
    useState(customer?.street ?? "");

  const [number, setNumber] =
    useState(customer?.number ?? "");

  const [
    complement,
    setComplement,
  ] = useState(
    customer?.complement ?? "",
  );

  const [
    neighborhood,
    setNeighborhood,
  ] = useState(
    customer?.neighborhood ?? "",
  );

  const [city, setCity] =
    useState(customer?.city ?? "");

  const [notes, setNotes] =
    useState(customer?.notes ?? "");

  function handleSave() {
    const normalizedName =
      name.trim();

    const normalizedPhone =
      phone.trim();

    if (
      !normalizedName ||
      !normalizedPhone
    ) {
      return;
    }

    onSave({
      id:
        customer?.id ??
        `customer-${Date.now()}`,
      name: normalizedName,
      phone: normalizedPhone,
      email: email.trim(),
      zipCode: zipCode.trim(),
      street: street.trim(),
      number: number.trim(),
      complement:
        complement.trim(),
      neighborhood:
        neighborhood.trim(),
      city: city.trim(),
      notes: notes.trim(),
    });

    onClose();
  }

  return (
    <div className="customer-drawer">
      <button
        type="button"
        className="customer-drawer__backdrop"
        onClick={onClose}
        aria-label="Fechar formulário"
      />

      <aside className="customer-drawer__panel">
        <header className="customer-drawer__header">
          <div>
            <span>
              {customer
                ? "Editar cliente"
                : "Novo cliente"}
            </span>

            <h2>
              {customer
                ? customer.name
                : "Cadastrar cliente"}
            </h2>

            <p>
              Preencha os dados
              principais do cliente.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X
              size={20}
              weight="bold"
            />
          </button>
        </header>

        <div className="customer-drawer__content">
          <section className="customer-drawer__section">
            <div className="customer-drawer__section-title">
              <User
                size={18}
                weight="bold"
              />

              <div>
                <strong>
                  Dados principais
                </strong>

                <span>
                  Identificação e
                  contato do cliente.
                </span>
              </div>
            </div>

            <label className="customer-drawer__field">
              <span>
                Nome do cliente
              </span>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Ex.: Mariana Souza"
              />
            </label>

            <div className="customer-drawer__grid">
              <label className="customer-drawer__field">
                <span>
                  Telefone / WhatsApp
                </span>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  placeholder="(51) 99999-9999"
                />
              </label>

              <label className="customer-drawer__field">
                <span>
                  E-mail
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="cliente@email.com"
                />
              </label>
            </div>
          </section>

          <section className="customer-drawer__section">
            <div className="customer-drawer__section-title">
              <MapPin
                size={18}
                weight="bold"
              />

              <div>
                <strong>
                  Endereço
                </strong>

                <span>
                  Dados usados para
                  futuras entregas.
                </span>
              </div>
            </div>

            <div className="customer-drawer__grid">
              <label className="customer-drawer__field">
                <span>CEP</span>

                <input
                  type="text"
                  value={zipCode}
                  onChange={(event) =>
                    setZipCode(
                      event.target.value,
                    )
                  }
                  placeholder="00000-000"
                />
              </label>

              <label className="customer-drawer__field">
                <span>Cidade</span>

                <input
                  type="text"
                  value={city}
                  onChange={(event) =>
                    setCity(
                      event.target.value,
                    )
                  }
                  placeholder="Cidreira"
                />
              </label>
            </div>

            <label className="customer-drawer__field">
              <span>Rua</span>

              <input
                type="text"
                value={street}
                onChange={(event) =>
                  setStreet(
                    event.target.value,
                  )
                }
                placeholder="Rua, avenida..."
              />
            </label>

            <div className="customer-drawer__grid customer-drawer__grid--address">
              <label className="customer-drawer__field">
                <span>Número</span>

                <input
                  type="text"
                  value={number}
                  onChange={(event) =>
                    setNumber(
                      event.target.value,
                    )
                  }
                  placeholder="123"
                />
              </label>

              <label className="customer-drawer__field">
                <span>Bairro</span>

                <input
                  type="text"
                  value={neighborhood}
                  onChange={(event) =>
                    setNeighborhood(
                      event.target.value,
                    )
                  }
                  placeholder="Centro"
                />
              </label>
            </div>

            <label className="customer-drawer__field">
              <span>
                Complemento
              </span>

              <input
                type="text"
                value={complement}
                onChange={(event) =>
                  setComplement(
                    event.target.value,
                  )
                }
                placeholder="Apartamento, bloco, referência..."
              />
            </label>
          </section>

          <section className="customer-drawer__section">
            <div className="customer-drawer__section-title">
              <Phone
                size={18}
                weight="bold"
              />

              <div>
                <strong>
                  Observações
                </strong>

                <span>
                  Informações úteis
                  para o atendimento.
                </span>
              </div>
            </div>

            <label className="customer-drawer__field">
              <span>
                Observação interna
              </span>

              <textarea
                rows={4}
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                placeholder="Ex.: prefere receber o pedido na portaria..."
              />
            </label>
          </section>
        </div>

        <footer className="customer-drawer__footer">
          <button
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              !name.trim() ||
              !phone.trim()
            }
          >
            <Check
              size={18}
              weight="bold"
            />

            {customer
              ? "Salvar alterações"
              : "Cadastrar cliente"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

export function CustomerFormDrawer({
  open,
  customer,
  onClose,
  onSave,
}: CustomerFormDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <CustomerFormContent
      key={
        customer?.id ??
        "new-customer"
      }
      customer={customer}
      onClose={onClose}
      onSave={onSave}
    />
  );
}