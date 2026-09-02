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

function CardBrandMark({ brand }: { brand: string }) {
  if (brand === "Visa") {
    return (
      <span className="brand-mark brand-mark--visa">
        VISA
      </span>
    );
  }

  if (brand === "Mastercard") {
    return (
      <span className="brand-mark brand-mark--mastercard">
        <span />
        <span />
      </span>
    );
  }

  if (brand === "Elo") {
    return (
      <span className="brand-mark brand-mark--elo">
        elo
      </span>
    );
  }

  return (
    <span className="brand-mark brand-mark--amex">
      AMEX
    </span>
  );
}

export default function PagamentosPage() {
  const [pixKey, setPixKey] = useState<string | null>(
    null,
  );
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

      setPixKey(settings.pixKey);
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
      acceptedCardBrands: acceptedBrands,
    });

    setIsSaving(false);

    setSaveMessage(
      result.success
        ? "Salvo com sucesso."
        : result.error,
    );
  }

  const pixIsActive = !!pixKey;

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
            O Pix automático é configurado pela nossa
            equipe direto no Mercado Pago quando sua
            empresa é cadastrada — o próprio banco
            confirma o pagamento e libera o pedido no
            painel, sem chave pra você digitar aqui. As
            bandeiras marcadas aparecem pro cliente no
            cardápio digital e ajudam o entregador a
            saber que o pagamento é na maquininha.
          </p>
        </SettingsHelp>
      </div>

      <form
        className="settings-card"
        onSubmit={handleSubmit}
      >
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
              <span>
                {pixIsActive
                  ? "Ativo — configurado pela nossa equipe"
                  : "Ainda não configurado"}
              </span>
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

          {!pixIsActive && (
            <p className="settings-payment__pix-note">
              Quer ativar o Pix automático? Fale com a
              Next Code — a configuração é feita pela
              nossa equipe, direto na sua conta do
              Mercado Pago.
            </p>
          )}
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
                    <CardBrandMark brand={brand} />
                    {brand}
                    {active && (
                      <Check
                        size={13}
                        weight="bold"
                      />
                    )}
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
