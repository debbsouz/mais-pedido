"use client";

import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";

export default function EstabelecimentoPage() {
  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>
            Estabelecimento
            <span className="settings-section__badge">
              Em breve
            </span>
          </h2>
          <p>
            Dados exibidos no cardápio digital que os
            clientes acessam.
          </p>
        </div>

        <SettingsHelp>
          <p>
            Nome, CNPJ, endereço e telefone da sua
            empresa. Essa tela ainda não está
            conectada ao banco de dados — os campos
            abaixo são só uma prévia de como vai
            ficar.
          </p>
        </SettingsHelp>
      </div>

      <form
        className="settings-form settings-form--grid"
        onSubmit={(event) => event.preventDefault()}
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

        <div className="settings-form__field settings-form__field--full">
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

        <div className="settings-form__field settings-form__field--full">
          <button
            type="submit"
            className="settings-form__submit"
            disabled
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
