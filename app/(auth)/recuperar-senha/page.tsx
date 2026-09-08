"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, EnvelopeSimple } from "@phosphor-icons/react";
import { useActionState } from "react";

import { requestPasswordReset } from "@/app/actions/auth";

export default function RecuperarSenhaPage() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  return (
    <section className="login-page">
      <div className="login-page__brand">
        <div className="login-page__brand-content">
          <Image
            src="/logo-mais-pedido.png"
            alt="+Pedido"
            width={220}
            height={70}
            priority
            className="login-page__logo"
          />

          <span className="login-page__eyebrow">
            Gestão completa para restaurantes
          </span>

          <h1>
            Seu restaurante,
            <br />
            mais organizado.
          </h1>

          <p>
            Pedidos, mesas, cozinha, entregas, caixa e gestão em um só lugar.
          </p>
        </div>
      </div>

      <div className="login-page__form-area">
        <div className="login-card">
          {state?.success ? (
            <>
              <div className="login-card__header">
                <span>Verifique seu e-mail</span>
                <h2>Link enviado</h2>
                <p>
                  Se esse e-mail tiver cadastro, você vai receber um
                  link pra criar uma senha nova em alguns minutos.
                </p>
              </div>

              <Link href="/login" className="login-form__submit">
                Voltar para o login
              </Link>
            </>
          ) : (
            <>
              <div className="login-card__header">
                <span>Acesso da equipe</span>
                <h2>Recuperar senha</h2>
                <p>
                  Digite o e-mail cadastrado. Vamos mandar um link
                  pra você criar uma senha nova.
                </p>
              </div>

              <form className="login-form" action={action}>
                <label className="login-field">
                  <span>E-mail</span>

                  <div className="login-field__control">
                    <EnvelopeSimple size={20} />
                    <input
                      type="email"
                      name="email"
                      placeholder="voce@restaurante.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                {state?.error && (
                  <div className="login-form__error">
                    <span>{state.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="login-form__submit"
                  disabled={pending}
                >
                  {pending ? "Enviando..." : "Enviar link"}
                </button>
              </form>

              <p className="login-card__support">
                <Link href="/login" className="login-page__back-link">
                  <ArrowLeft size={16} weight="bold" />
                  Voltar para o login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
