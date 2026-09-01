"use client";

import { ChatCircleDots, Crown } from "@phosphor-icons/react";

import { SettingsHelp } from "@/components/configuracoes/SettingsHelp";
import { useCurrentSubscription } from "@/components/providers/AuthProvider";
import { plans } from "@/lib/plans";

export default function PlanoPage() {
  const subscription = useCurrentSubscription();
  const plan = plans[subscription.planId];

  return (
    <div>
      <div className="settings-section__header">
        <div>
          <h2>Plano</h2>
          <p>Sua assinatura atual do +Pedido.</p>
        </div>

        <SettingsHelp>
          <p>
            Aqui você vê o plano contratado e o valor
            mensal. Pra mudar de plano ou tirar
            dúvida, fale com um especialista.
          </p>
        </SettingsHelp>
      </div>

      <div className="settings-plan">
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
          <p>{plan.description}</p>

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
      </div>
    </div>
  );
}
