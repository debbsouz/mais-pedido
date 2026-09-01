"use client";

import { Buildings } from "@phosphor-icons/react";

import { SettingsPageHeader } from "@/components/configuracoes/SettingsPageHeader";

export default function EstabelecimentoPage() {
  return (
    <section className="settings-page">
      <SettingsPageHeader
        icon={Buildings}
        title="Estabelecimento"
        description="Dados exibidos no cardápio digital que os clientes acessam."
      />

      <div className="settings-page__cards settings-page__cards--single">
        <article className="settings-card">
          <div className="settings-card__header">
            <span className="settings-card__badge">
              Em breve
            </span>
          </div>

          <form
            className="settings-form"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <div className="settings-form__field">
              <span>Nome da empresa</span>
              <input
                type="text"
                defaultValue="Burger House"
              />
            </div>

            <div className="settings-form__field">
              <span>CNPJ (opcional)</span>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="settings-form__field">
              <span>Endereço</span>
              <input
                type="text"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            <div className="settings-form__field">
              <span>Telefone</span>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
              />
            </div>

            <button
              type="submit"
              className="settings-form__submit"
              disabled
            >
              Salvar alterações
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
