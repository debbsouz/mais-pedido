"use client";

import { useState } from "react";

import { Check, QrCode } from "@phosphor-icons/react";

import { SettingsPageHeader } from "@/components/configuracoes/SettingsPageHeader";

const cardBrands = [
  "Visa",
  "Mastercard",
  "Elo",
  "American Express",
];

export default function PagamentosPage() {
  const [acceptedBrands, setAcceptedBrands] = useState<
    string[]
  >([]);

  function toggleBrand(brand: string) {
    setAcceptedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand],
    );
  }

  return (
    <section className="settings-page">
      <SettingsPageHeader
        icon={QrCode}
        title="Pagamentos"
        description="Formas de pagamento aceitas pelo seu estabelecimento."
      />

      <div className="settings-page__cards settings-page__cards--single">
        <article className="settings-card">
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

              <span className="settings-payment__status">
                Ativo
              </span>
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
                      onClick={() =>
                        toggleBrand(brand)
                      }
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
        </article>
      </div>
    </section>
  );
}
