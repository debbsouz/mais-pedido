"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowCounterClockwise,
  House,
  WarningCircle,
} from "@phosphor-icons/react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Fallback de erro pra qualquer página fora do painel (login, loja
 * pública, garçom/atendente). O painel tem seu próprio
 * app/(panel)/error.tsx, que mantém a Sidebar visível.
 */
export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="error-page">
      <div className="error-page__card">
        <Image
          src="/logo-mais-pedido.png"
          alt="+Pedido"
          width={140}
          height={44}
          className="error-page__logo"
        />

        <div className="error-page__icon">
          <WarningCircle size={28} weight="fill" />
        </div>

        <h1>Algo deu errado</h1>

        <p>
          Não conseguimos carregar esta página. Tente de novo — se
          continuar acontecendo, volte para o início e tente outro
          caminho.
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

          <Link
            href="/"
            className="error-page__button"
          >
            <House size={16} weight="bold" />
            Voltar para o início
          </Link>
        </div>
      </div>
    </section>
  );
}
