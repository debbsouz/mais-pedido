"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, Lock } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type PageStatus = "loading" | "ready" | "invalid" | "done";

export default function RedefinirSenhaPage() {
  const router = useRouter();

  const [status, setStatus] = useState<PageStatus>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function establishSession() {
      // Formato do link de convite/recuperar senha do Supabase:
      // tokens no #hash da URL (não chega no servidor, só no
      // navegador). O cliente não detecta isso sozinho, então lê o
      // hash na mão e abre a sessão explicitamente.
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

        if (!cancelled) {
          setStatus(sessionError ? "invalid" : "ready");
        }

        // Tira os tokens da URL depois de usados.
        window.history.replaceState(
          null,
          "",
          window.location.pathname,
        );

        return;
      }

      // Alguns projetos Supabase usam o fluxo PKCE (?code=... na
      // URL) em vez do #hash de sempre.
      const code = new URLSearchParams(
        window.location.search,
      ).get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (!cancelled) {
          setStatus(exchangeError ? "invalid" : "ready");
        }

        return;
      }

      // Sem token na URL — só continua se já existir uma sessão
      // ativa (ex.: página recarregada logo depois de já ter
      // aberto a sessão).
      const { data } = await supabase.auth.getSession();

      if (!cancelled) {
        setStatus(data.session ? "ready" : "invalid");
      }
    }

    void establishSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setSubmitting(false);

    if (updateError) {
      setError("Não foi possível salvar a senha. Tente novamente.");
      return;
    }

    setStatus("done");
    window.setTimeout(() => router.push("/inicio"), 1200);
  }

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
        </div>
      </div>

      <div className="login-page__form-area">
        <div className="login-card">
          {status === "invalid" && (
            <>
              <div className="login-card__header">
                <span>Link inválido</span>
                <h2>Esse link expirou</h2>
                <p>
                  Peça um novo link em &quot;Esqueci minha
                  senha&quot;, na tela de login.
                </p>
              </div>

              <Link href="/recuperar-senha" className="login-form__submit">
                Pedir novo link
              </Link>
            </>
          )}

          {status === "done" && (
            <div className="login-card__header">
              <span>Tudo certo</span>
              <h2>Senha salva!</h2>
              <p>Entrando no painel...</p>
            </div>
          )}

          {(status === "loading" || status === "ready") && (
            <>
              <div className="login-card__header">
                <span>Quase lá</span>
                <h2>Defina sua senha</h2>
                <p>Escolha a senha que você vai usar pra entrar.</p>
              </div>

              <form
                className="login-form"
                onSubmit={handleSubmit}
              >
                <label className="login-field">
                  <span>Nova senha</span>

                  <div className="login-field__control">
                    <Lock size={20} />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Pelo menos 6 caracteres"
                      autoComplete="new-password"
                      disabled={status === "loading"}
                    />

                    <button
                      type="button"
                      className="login-field__password-toggle"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      {showPassword ? (
                        <EyeSlash size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </label>

                <label className="login-field">
                  <span>Confirmar senha</span>

                  <div className="login-field__control">
                    <Lock size={20} />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Digite a mesma senha"
                      autoComplete="new-password"
                      disabled={status === "loading"}
                    />
                  </div>
                </label>

                {error && (
                  <div className="login-form__error">
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="login-form__submit"
                  disabled={submitting || status === "loading"}
                >
                  {status === "loading"
                    ? "Verificando link..."
                    : submitting
                      ? "Salvando..."
                      : "Salvar senha e entrar"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
