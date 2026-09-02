"use client";

import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";

export default function EquipePage() {
  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>
            Equipe
            <span className="settings-section__badge">
              Em breve
            </span>
          </h2>
          <p>
            Contas de acesso para cozinha, garçom,
            atendente e entregador.
          </p>
        </div>

        <SettingsHelp>
          <p>
            Cadastre um funcionário com e-mail, senha
            e cargo, e ele passa a ter acesso só às
            telas do próprio cargo. Esse cadastro
            chega em breve.
          </p>
        </SettingsHelp>
      </div>

      <form
        className="settings-card settings-form settings-form--grid"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="settings-form__field">
          <span>Nome completo</span>
          <input
            type="text"
            placeholder="Ex: Ana Souza"
          />
        </div>

        <div className="settings-form__field">
          <span>E-mail</span>
          <input
            type="email"
            placeholder="ana@burgerhouse.com"
          />
        </div>

        <div className="settings-form__field">
          <span>Senha</span>
          <input
            type="password"
            placeholder="Senha de acesso"
            disabled
          />
        </div>

        <div className="settings-form__field">
          <span>Cargo</span>
          <select defaultValue="">
            <option
              value=""
              disabled
            >
              Selecione um cargo
            </option>
            <option value="kitchen">
              Cozinheiro
            </option>
            <option value="waiter">Garçom</option>
            <option value="attendant">
              Atendente
            </option>
            <option value="delivery">
              Entregador
            </option>
          </select>
        </div>

        <div className="settings-form__field settings-form__field--full">
          <button
            type="submit"
            className="settings-form__submit"
            disabled
          >
            Cadastrar funcionário
          </button>
        </div>
      </form>
    </div>
  );
}
