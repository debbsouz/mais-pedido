"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  type BusinessHourEntry,
  getBusinessHours,
  updateBusinessHours,
} from "@/app/actions/business-hours";
import {
  getStoreSettings,
  updateEstabelecimento,
} from "@/app/actions/store-settings";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";
import {
  isWithinBusinessHours,
  WEEKDAY_SHORT_LABELS,
} from "@/lib/storefront/business-hours";

export default function EstabelecimentoPage() {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    string | null
  >(null);
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

      setName(settings.name);
      setCnpj(settings.cnpj ?? "");
      setPhone(settings.phone ?? "");
    });

    void getBusinessHours().then(setHours);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setIsSaving(true);
    setSaveMessage(null);

    const result = await updateEstabelecimento({
      name,
      cnpj,
      phone,
    });

    setIsSaving(false);

    setSaveMessage(
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
          <h2>Estabelecimento</h2>
          <p>
            Nome e telefone aparecem no cardápio
            digital que os clientes acessam.
          </p>
        </div>

        <SettingsHelp>
          <p>
            O nome aparece no topo da sua loja pública.
            O telefone é o mesmo número usado no botão
            de WhatsApp do cardápio digital — não
            precisa cadastrar de novo em outro lugar.
            O CNPJ fica só de uso interno, nunca
            aparece pro cliente.
          </p>
        </SettingsHelp>
      </div>

      <form
        className="settings-card settings-form settings-form--grid"
        onSubmit={handleSubmit}
      >
        <div className="settings-form__field">
          <span>Nome da empresa</span>
          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field">
          <span>Telefone / WhatsApp</span>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field">
          <span>CNPJ (opcional)</span>
          <input
            type="text"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={(event) =>
              setCnpj(event.target.value)
            }
          />
        </div>

        <div className="settings-form__field settings-form__field--full">
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

      <div className="settings-section__header settings-section__header--secondary">
        <div>
          <h3>Horário de funcionamento</h3>
          <p>
            Defina os dias e horários em que a loja
            abre e fecha sozinha, sem precisar apertar
            nada. O interruptor &ldquo;Loja
            aberta/fechada&rdquo; no topo continua
            funcionando como um botão de emergência,
            pra fechar mesmo dentro do horário
            programado.
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
          className="settings-card settings-hours"
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
