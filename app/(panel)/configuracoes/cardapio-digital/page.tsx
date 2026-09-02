"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  ArrowSquareOut,
  Copy,
  LinkSimple,
} from "@phosphor-icons/react";

import {
  type BusinessHourEntry,
  getBusinessHours,
  updateBusinessHours,
} from "@/app/actions/business-hours";
import {
  getStoreSettings,
  updateStoreSettings,
} from "@/app/actions/store-settings";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";
import {
  isWithinBusinessHours,
  WEEKDAY_SHORT_LABELS,
} from "@/lib/storefront/business-hours";

export default function CardapioDigitalPage() {
  const [storeSlug, setStoreSlug] = useState<
    string | null
  >(null);
  const [minOrder, setMinOrder] = useState("0");
  const [instagramUrl, setInstagramUrl] =
    useState("");
  const [facebookUrl, setFacebookUrl] =
    useState("");
  const [isSavingStore, setIsSavingStore] =
    useState(false);
  const [storeSaveMessage, setStoreSaveMessage] =
    useState<string | null>(null);
  const [linkCopied, setLinkCopied] =
    useState(false);
  const [hours, setHours] = useState<
    BusinessHourEntry[] | null
  >(null);
  const [isSavingHours, setIsSavingHours] =
    useState(false);
  const [hoursSaveMessage, setHoursSaveMessage] =
    useState<string | null>(null);

  useEffect(() => {
    void getStoreSettings().then((settings) => {
      if (!settings) {
        return;
      }

      setStoreSlug(settings.slug);
      setMinOrder(
        (settings.minOrderCents / 100).toFixed(2),
      );
      setInstagramUrl(settings.instagramUrl ?? "");
      setFacebookUrl(settings.facebookUrl ?? "");
    });

    void getBusinessHours().then(setHours);
  }, []);

  const storeUrl =
    storeSlug && typeof window !== "undefined"
      ? `${window.location.origin}/loja/${storeSlug}`
      : null;

  async function handleCopyStoreUrl() {
    if (!storeUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(storeUrl);
      setLinkCopied(true);
      window.setTimeout(
        () => setLinkCopied(false),
        2000,
      );
    } catch {
      // Sem permissão de área de transferência — ignora.
    }
  }

  async function handleSaveStoreSettings(
    event: FormEvent,
  ) {
    event.preventDefault();

    setIsSavingStore(true);
    setStoreSaveMessage(null);

    const minOrderCents = Math.round(
      Number(minOrder.replace(",", ".")) * 100,
    );

    const result = await updateStoreSettings({
      minOrderCents: Number.isFinite(minOrderCents)
        ? minOrderCents
        : 0,
      instagramUrl,
      facebookUrl,
    });

    setIsSavingStore(false);

    setStoreSaveMessage(
      result.success
        ? "Salvo com sucesso."
        : result.error,
    );
  }

  function updateDay(
    dayOfWeek: number,
    patch: Partial<BusinessHourEntry>,
  ) {
    setHours((prev) =>
      (prev ?? []).map((entry) =>
        entry.dayOfWeek === dayOfWeek
          ? { ...entry, ...patch }
          : entry,
      ),
    );
  }

  function applyFirstConfiguredToAllDays() {
    setHours((prev) => {
      if (!prev) {
        return prev;
      }

      const reference = prev.find(
        (entry) =>
          !entry.isClosed &&
          entry.opensAt &&
          entry.closesAt,
      );

      if (!reference) {
        return prev;
      }

      return prev.map((entry) => ({
        ...entry,
        isClosed: false,
        opensAt: reference.opensAt,
        closesAt: reference.closesAt,
      }));
    });
  }

  async function handleSaveHours(event: FormEvent) {
    event.preventDefault();

    if (!hours) {
      return;
    }

    setIsSavingHours(true);
    setHoursSaveMessage(null);

    const result = await updateBusinessHours(hours);

    setIsSavingHours(false);

    setHoursSaveMessage(
      result.success
        ? "Salvo com sucesso."
        : result.error,
    );
  }

  const hasAnyScheduledDay =
    hours?.some((entry) => !entry.isClosed) ?? false;
  const isOpenNowBySchedule = hours
    ? isWithinBusinessHours(hours)
    : null;

  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>Cardápio Digital</h2>
          <p>
            O link da sua loja pública e o que os
            clientes veem nela.
          </p>
        </div>

        <SettingsHelp>
          <p>
            Essa é a página que o seu cliente acessa
            pelo link, sem precisar de login. Copie o
            link abaixo e envie no WhatsApp, Instagram
            ou onde preferir. O botão de WhatsApp da
            loja usa o telefone cadastrado na aba
            Estabelecimento.
          </p>
        </SettingsHelp>
      </div>

      {storeUrl && (
        <div className="settings-store-link">
          <div className="settings-store-link__url">
            <LinkSimple size={16} />
            <span>{storeUrl}</span>
          </div>

          <div className="settings-store-link__actions">
            <button
              type="button"
              onClick={handleCopyStoreUrl}
              className="settings-store-link__button"
            >
              <Copy
                size={15}
                weight="bold"
              />
              {linkCopied
                ? "Copiado!"
                : "Copiar link"}
            </button>

            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="settings-store-link__button settings-store-link__button--primary"
            >
              <ArrowSquareOut
                size={15}
                weight="bold"
              />
              Ver minha loja
            </a>
          </div>
        </div>
      )}

      <form
        className="settings-form settings-form--grid"
        onSubmit={handleSaveStoreSettings}
      >
        <div className="settings-form__field">
          <span>Pedido mínimo (R$)</span>
          <input
            type="text"
            inputMode="decimal"
            value={minOrder}
            onChange={(event) =>
              setMinOrder(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field">
          <span>Instagram</span>
          <input
            type="url"
            placeholder="https://instagram.com/suaempresa"
            value={instagramUrl}
            onChange={(event) =>
              setInstagramUrl(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field settings-form__field--full">
          <span>Facebook</span>
          <input
            type="url"
            placeholder="https://facebook.com/suaempresa"
            value={facebookUrl}
            onChange={(event) =>
              setFacebookUrl(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field settings-form__field--full">
          <button
            type="submit"
            className="settings-form__submit"
            disabled={isSavingStore}
          >
            {isSavingStore
              ? "Salvando..."
              : "Salvar alterações"}
          </button>

          {storeSaveMessage && (
            <small className="settings-form__note">
              {storeSaveMessage}
            </small>
          )}
        </div>
      </form>

      <div className="settings-section__header settings-section__header--secondary">
        <div>
          <h3>Horário de funcionamento</h3>
          <p>
            Defina os dias e horários em que a loja
            abre e fecha sozinha, sem precisar apertar
            nada. O interruptor &ldquo;Loja
            aberta/fechada&rdquo; no topo continua
            funcionando como um botão
            de emergência, pra fechar mesmo dentro do
            horário programado.
          </p>
        </div>

        <SettingsHelp>
          <p>
            Marque &ldquo;Fechado&rdquo; nos dias sem
            funcionamento. Nos dias abertos, preencha
            o horário de abertura e fechamento — se o
            funcionamento passa da meia-noite (ex.:
            sexta 18h às 02h), pode preencher normal,
            o sistema entende. Se nenhum dia for
            configurado, a loja continua controlada só
            pelo interruptor manual, como já era antes.
          </p>
        </SettingsHelp>
      </div>

      {hours && (
        <form
          className="settings-hours"
          onSubmit={handleSaveHours}
        >
          {hasAnyScheduledDay && (
            <div
              className={`settings-hours__preview${
                isOpenNowBySchedule
                  ? ""
                  : " settings-hours__preview--closed"
              }`}
            >
              {isOpenNowBySchedule
                ? "Pelo horário programado, a loja está aberta agora."
                : "Pelo horário programado, a loja está fechada agora."}
            </div>
          )}

          <div className="settings-hours__table">
            {hours.map((entry) => (
              <div
                key={entry.dayOfWeek}
                className="settings-hours__row"
              >
                <span className="settings-hours__day">
                  {WEEKDAY_SHORT_LABELS[entry.dayOfWeek]}
                </span>

                <label className="settings-hours__closed">
                  <input
                    type="checkbox"
                    checked={entry.isClosed}
                    onChange={(event) =>
                      updateDay(entry.dayOfWeek, {
                        isClosed:
                          event.target.checked,
                      })
                    }
                  />
                  Fechado
                </label>

                <input
                  type="time"
                  disabled={entry.isClosed}
                  value={entry.opensAt ?? ""}
                  onChange={(event) =>
                    updateDay(entry.dayOfWeek, {
                      opensAt: event.target.value,
                    })
                  }
                />

                <span className="settings-hours__separator">
                  às
                </span>

                <input
                  type="time"
                  disabled={entry.isClosed}
                  value={entry.closesAt ?? ""}
                  onChange={(event) =>
                    updateDay(entry.dayOfWeek, {
                      closesAt: event.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="settings-hours__footer">
            <button
              type="button"
              className="settings-hours__copy"
              onClick={applyFirstConfiguredToAllDays}
            >
              Usar o mesmo horário todos os dias
            </button>

            <div className="settings-hours__submit-row">
              <button
                type="submit"
                className="settings-form__submit"
                disabled={isSavingHours}
              >
                {isSavingHours
                  ? "Salvando..."
                  : "Salvar horário"}
              </button>

              {hoursSaveMessage && (
                <small className="settings-form__note">
                  {hoursSaveMessage}
                </small>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
