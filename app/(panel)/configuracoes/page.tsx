"use client";

import { useState } from "react";

import {
  Buildings,
  Check,
  ChatCircleDots,
  Crown,
  ImageSquare,
  QrCode,
  UsersThree,
} from "@phosphor-icons/react";

import { useCurrentSubscription } from "@/components/providers/AuthProvider";
import { plans } from "@/lib/plans";

const cardBrands = [
  "Visa",
  "Mastercard",
  "Elo",
  "American Express",
];

export default function ConfiguracoesPage() {
  const subscription =
    useCurrentSubscription();

  const plan = plans[subscription.planId];

  const [
    acceptedBrands,
    setAcceptedBrands,
  ] = useState<string[]>([]);

  function toggleBrand(brand: string) {
    setAcceptedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter(
            (item) => item !== brand,
          )
        : [...prev, brand],
    );
  }

  return (
    <section className="settings-page">
      <header className="settings-page__header">
        <span>Gestão da unidade</span>
        <h1>Configurações</h1>
        <p>Dados do estabelecimento.</p>
      </header>

      <div className="settings-page__cards">
        <article className="settings-card">
          <div className="settings-card__header">
            <Buildings
              size={20}
              weight="bold"
            />
            <h2>Estabelecimento</h2>
            <span className="settings-card__badge">
              Em breve
            </span>
          </div>

          <p className="settings-card__hint">
            Essas informações aparecem no cardápio
            digital que os clientes vão acessar.
          </p>

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

            <small className="settings-form__note">
              Essa funcionalidade será ativada em
              breve, junto com o backend.
            </small>
          </form>
        </article>

        <article className="settings-card settings-card--plan">
          <div className="settings-plan__hero">
            <div className="settings-plan__hero-icon">
              <Crown
                size={20}
                weight="fill"
              />
            </div>

            <div className="settings-plan__hero-info">
              <span>Plano atual</span>
              <strong>{plan.name}</strong>
            </div>

            <div className="settings-plan__hero-price">
              <strong>
                R$ {plan.price}
              </strong>
              <span>/mês</span>
            </div>
          </div>

          <div className="settings-plan__body">
            <p className="settings-card__hint">
              {plan.description}
            </p>

            <button
              type="button"
              className="settings-plan__cta"
              disabled
            >
              <ChatCircleDots
                size={18}
                weight="bold"
              />
              Falar com um especialista
            </button>

            <small className="settings-form__note">
              Canal de contato ainda será definido —
              em breve.
            </small>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card__header">
            <UsersThree
              size={20}
              weight="bold"
            />
            <h2>Equipe</h2>
            <span className="settings-card__badge">
              Em breve
            </span>
          </div>

          <p className="settings-card__hint">
            Cadastre contas de acesso para cozinha,
            garçom, atendente e entregador.
          </p>

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

            <small className="settings-form__note">
              Essa funcionalidade será ativada em
              breve, junto com o backend.
            </small>
          </form>
        </article>

        <article className="settings-card">
          <div className="settings-card__header">
            <ImageSquare
              size={20}
              weight="bold"
            />
            <h2>Identidade visual</h2>
            <span className="settings-card__badge">
              Em breve
            </span>
          </div>

          <p className="settings-card__hint">
            Personalize a logo e o banner exibidos
            para os clientes.
          </p>

          <div className="settings-brand__uploads">
            <div className="settings-brand__upload">
              <ImageSquare
                size={26}
                weight="duotone"
              />
              <strong>Logo</strong>
              <span>PNG ou JPG</span>
            </div>

            <div className="settings-brand__upload">
              <ImageSquare
                size={26}
                weight="duotone"
              />
              <strong>Banner</strong>
              <span>PNG ou JPG</span>
            </div>
          </div>

          <small className="settings-form__note">
            O envio de imagens será ativado em
            breve, junto com o backend.
          </small>
        </article>

        <article className="settings-card">
          <div className="settings-card__header">
            <QrCode
              size={20}
              weight="bold"
            />
            <h2>Pagamentos</h2>
          </div>

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
                    acceptedBrands.includes(
                      brand,
                    );

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
