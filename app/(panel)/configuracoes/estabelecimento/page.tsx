"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  getStoreSettings,
  updateEstabelecimento,
} from "@/app/actions/store-settings";
import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";

export default function EstabelecimentoPage() {
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    void getStoreSettings().then((settings) => {
      if (!settings) {
        return;
      }

      setName(settings.name);
      setCnpj(settings.cnpj ?? "");
      setPhone(settings.phone ?? "");
    });
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
        className="settings-form settings-form--grid"
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
    </div>
  );
}
