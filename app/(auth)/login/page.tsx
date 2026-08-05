"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeSlash, Lock, User } from "@phosphor-icons/react";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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

          <div className="login-page__benefits">
            <span>Pedidos centralizados</span>
            <span>Operação em tempo real</span>
            <span>Experiências por perfil</span>
          </div>
        </div>
      </div>

      <div className="login-page__form-area">
        <div className="login-card">
          <div className="login-card__header">
            <span>Acesso da equipe</span>
            <h2>Entre no painel</h2>
            <p>Use os dados cadastrados pelo estabelecimento.</p>
          </div>

          <form className="login-form">
            <label className="login-field">
              <span>E-mail</span>

              <div className="login-field__control">
                <User size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="voce@restaurante.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="login-field">
              <span>Senha</span>

              <div className="login-field__control">
                <Lock size={20} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-field__password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeSlash size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </label>

            <div className="login-form__options">
              <label className="login-remember">
                <input type="checkbox" />
                <span>Lembrar acesso</span>
              </label>

              <Link href="/recuperar-senha">Esqueci minha senha</Link>
            </div>

            <button type="submit" className="login-form__submit">
              Entrar no painel
            </button>
          </form>

          <p className="login-card__support">
            Precisa de ajuda? Fale com o suporte do +Pedido.
          </p>
        </div>
      </div>
    </section>
  );
}