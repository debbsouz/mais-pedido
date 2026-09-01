"use client";

import { ChatCircleDots, Crown } from "@phosphor-icons/react";

import { SettingsPageHeader } from "@/components/configuracoes/SettingsPageHeader";
import { useCurrentSubscription } from "@/components/providers/AuthProvider";
import { plans } from "@/lib/plans";

export default function PlanoPage() {
  const subscription = useCurrentSubscription();
  const plan = plans[subscription.planId];

  return (
    <section className="settings-page">
      <SettingsPageHeader
        icon={Crown}
        title="Plano"
        description="Sua assinatura atual do +Pedido."
      />

      <div className="settings-page__cards settings-page__cards--single">
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
              <strong>R$ {plan.price}</strong>
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
          </div>
        </article>
      </div>
    </section>
  );
}
