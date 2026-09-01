"use client";

import { UsersThree } from "@phosphor-icons/react";

import { SettingsPageHeader } from "@/components/configuracoes/SettingsPageHeader";

export default function EquipePage() {
  return (
    <section className="settings-page">
      <SettingsPageHeader
        icon={UsersThree}
        title="Equipe"
        description="Contas de acesso para cozinha, garçom, atendente e entregador."
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
                <option value="waiter">
                  Garçom
                </option>
                <option value="attendant">
                  Atendente
                </option>
                <option value="delivery">
                  Entregador
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="settings-form__submit"
              disabled
            >
              Cadastrar funcionário
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
