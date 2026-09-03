"use client";

import { useEffect } from "react";

import {
  ArrowCounterClockwise,
  WarningCircle,
} from "@phosphor-icons/react";

interface PanelErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Fallback de erro dentro do painel — a Sidebar/Topbar continuam
 * visíveis (esse error.tsx só substitui o conteúdo da página,
 * não o layout), então quem usa o sistema não perde a navegação.
 */
export default function PanelErrorPage({
  error,
  reset,
}: PanelErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="error-page error-page--inline">
      <div className="error-page__card">
        <div className="error-page__icon">
          <WarningCircle size={28} weight="fill" />
        </div>

        <h1>Algo deu errado nesta tela</h1>

        <p>
          Não conseguimos carregar esta parte do painel. O resto do
          sistema continua funcionando normalmente — tente
          novamente ou vá para outra tela pelo menu.
        </p>

        <div className="error-page__actions">
          <button
            type="button"
            className="error-page__button error-page__button--primary"
            onClick={reset}
          >
            <ArrowCounterClockwise size={16} weight="bold" />
            Tentar novamente
          </button>
        </div>
      </div>
    </section>
  );
}
