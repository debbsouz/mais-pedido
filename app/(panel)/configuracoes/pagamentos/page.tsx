"use client";

import { type FormEvent, useEffect, useState } from "react";

import { Check, QrCode } from "@phosphor-icons/react";

import {
  getStoreSettings,
  updatePaymentSettings,
} from "@/app/actions/store-settings";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";

const cardBrands = [
  "Visa",
  "Mastercard",
  "Elo",
  "American Express",
];

const pixKeyTypes = [
  { value: "cpf_cnpj", label: "CPF/CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave aleatória" },
];

export default function PagamentosPage() {
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] =
    useState("cpf_cnpj");
  const [acceptedBrands, setAcceptedBrands] = useState<
    string[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    void getStoreSettings().then((settings) => {
      if (!settings) {
        return;
      }

      setPixKey(settings.pixKey ?? "");
      setPixKeyType(
        settings.pixKeyType ?? "cpf_cnpj",
      );
      setAcceptedBrands(settings.acceptedCardBrands);
    });
  }, []);

  function toggleBrand(brand: string) {
    setAcceptedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setIsSaving(true);
    setSaveMessage(null);

    const result = await updatePaymentSettings({
      pixKey,
      pixKeyType,
      acceptedCardBrands: acceptedBrands,
    });

    setIsSaving(false);

    setSaveMessage(
      result.success
        ? "Salvo com sucesso."
        : result.error,
    );
  }

  const pixIsActive = pixKey.trim().length > 0;

  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>Pagamentos</h2>
          <p>
            Formas de pagamento aceitas pelo seu
            estabelecimento.
          </p>
        </div>

        <SettingsHelp>
          <p>
            A chave Pix cadastrada aqui ainda não gera
            cobrança automática nem QR Code — é só o
            cadastro, preparado pra quando essa
            integração for construída. As bandeiras
            marcadas aparecem pro cliente no cardápio
            digital e ajudam o entregador a saber que o
            pagamento é na maquininha.
          </p>
        </SettingsHelp>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="settings-payment__group">
          <span className="settings-payment__eyebrow">
            Pagamento online
          </span>

          <div className="settings-payment__online">
            <div className="settings-payment__online-icon">
              <QrCode
                size={20}
                weight="bold"
              />
            </div>

            <div className="settings-payment__online-text">
              <strong>Pix</strong>
              <span>Pagamento via Pix</span>
            </div>

            <span
              className={`settings-payment__status${
                pixIsActive
                  ? ""
                  : " settings-payment__status--off"
              }`}
            >
              {pixIsActive
                ? "Ativo"
                : "Não configurado"}
            </span>
          </div>

          <div className="settings-form settings-form--grid">
            <div className="settings-form__field">
              <span>Chave Pix</span>
              <input
                type="text"
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                value={pixKey}
                onChange={(event) =>
                  setPixKey(event.target.value)
                }
              />
            </div>

            <div className="settings-form__field">
              <span>Tipo de chave</span>
              <select
                value={pixKeyType}
                onChange={(event) =>
                  setPixKeyType(event.target.value)
                }
              >
                {pixKeyTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="settings-payment__group">
          <span className="settings-payment__eyebrow">
            Pagamento na entrega
          </span>

          <div className="settings-payment__section">
            <span className="settings-payment__label">
              Bandeiras aceitas
            </span>

            <div className="settings-payment__brands">
              {cardBrands.map((brand) => {
                const active =
                  acceptedBrands.includes(brand);

                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`settings-payment__brand${
                      active
                        ? " settings-payment__brand--active"
                        : ""
                    }`}
                  >
                    {active && (
                      <Check
                        size={13}
                        weight="bold"
                      />
                    )}
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="settings-payment__footer">
          <button
            type="submit"
            className="settings-form__submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Salvando..."
              : "Salvar alterações"}
          </button>

          {saveMessage && (
            <small className="settings-form__note">
              {saveMessage}
            </small>
          )}
        </div>
      </form>
    </div>
  );
}
