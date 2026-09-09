"use client";

import { type FormEvent, useEffect, useState } from "react";

import { Coins } from "@phosphor-icons/react";

import {
  getStoreSettings,
  updateCashbackSettings,
} from "@/app/actions/store-settings";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";

export function CashbackSection() {
  const [enabled, setEnabled] = useState(false);
  const [percent, setPercent] = useState("5");
  const [minOrder, setMinOrder] = useState("");
  const [minRedeem, setMinRedeem] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    void getStoreSettings().then((settings) => {
      if (!settings) {
        return;
      }

      setEnabled(settings.cashbackEnabled);

      if (settings.cashbackPercent) {
        setPercent(String(settings.cashbackPercent));
      }

      setMinOrder(
        settings.cashbackMinOrderCents
          ? (
              settings.cashbackMinOrderCents / 100
            ).toFixed(2)
          : "",
      );

      setMinRedeem(
        settings.cashbackMinRedeemCents
          ? (
              settings.cashbackMinRedeemCents / 100
            ).toFixed(2)
          : "",
      );

      setLoaded(true);
    });
  }, []);

  function parseOptionalMoney(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const cents = Math.round(
      Number(trimmed.replace(",", ".")) * 100,
    );

    return Number.isFinite(cents) ? cents : null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setIsSaving(true);
    setSaveMessage(null);

    const result = await updateCashbackSettings({
      enabled,
      percent: enabled ? Number(percent) || null : null,
      minOrderCents: parseOptionalMoney(minOrder),
      minRedeemCents: parseOptionalMoney(minRedeem),
    });

    setIsSaving(false);

    setSaveMessage(
      result.success
        ? "Salvo com sucesso."
        : result.error,
    );
  }

  return (
    <>
      <div className="settings-section__header settings-section__header--secondary">
        <div>
          <h3>Cashback</h3>
          <p>
            Devolva parte do valor de cada pedido como crédito pro
            cliente usar numa próxima compra na sua loja.
          </p>
        </div>

        <SettingsHelp>
          <p>
            O cliente ganha o percentual configurado assim que você
            marca o pedido dele como concluído. Da próxima vez que
            ele comprar (identificado pelo telefone), pode usar esse
            saldo como desconto. Você decide o percentual e os
            mínimos — cada empresa configura do seu jeito.
          </p>
        </SettingsHelp>
      </div>

      <form
        className="settings-card settings-form settings-form--grid"
        onSubmit={handleSubmit}
      >
        <label className="settings-form__field settings-form__field--full settings-cashback__toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) =>
              setEnabled(event.target.checked)
            }
          />
          <span>Ativar cashback pra essa empresa</span>
        </label>

        {enabled && (
          <>
            <div className="settings-form__field">
              <span>Percentual de volta (%)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 5"
                value={percent}
                onChange={(event) =>
                  setPercent(
                    event.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
              />
            </div>

            <div className="settings-form__field">
              <span>Pedido mínimo pra ganhar (R$)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Opcional"
                value={minOrder}
                onChange={(event) =>
                  setMinOrder(event.target.value)
                }
              />
            </div>

            <div className="settings-form__field">
              <span>Saldo mínimo pra usar (R$)</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Opcional"
                value={minRedeem}
                onChange={(event) =>
                  setMinRedeem(event.target.value)
                }
              />
            </div>
          </>
        )}

        <div className="settings-form__field settings-form__field--full">
          <button
            type="submit"
            className="settings-form__submit"
            disabled={isSaving || !loaded}
          >
            <Coins size={16} weight="bold" />
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </button>

          {saveMessage && (
            <small className="settings-form__note">
              {saveMessage}
            </small>
          )}
        </div>
      </form>
    </>
  );
}
