"use client";

import {
  Bell,
  CaretDown,
  CheckCircle,
  Gear,
  Moon,
  SignOut,
  Storefront,
  Sun,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const THEME_STORAGE_KEY =
  "mais-pedido-theme";

const STORE_STATUS_STORAGE_KEY =
  "mais-pedido-store-status";

type Theme =
  | "light"
  | "dark";

type StoreStatus =
  | "open"
  | "closed";

export function Topbar() {
  const [theme, setTheme] =
    useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(
      THEME_STORAGE_KEY,
    );

    if (
      stored === "dark" ||
      stored === "light"
    ) {
      setTheme(stored);
    }
  }, []);

  const [
    storeStatus,
    setStoreStatus,
  ] =
    useState<StoreStatus>("open");

  useEffect(() => {
    const stored = localStorage.getItem(
      STORE_STATUS_STORAGE_KEY,
    );

    if (
      stored === "open" ||
      stored === "closed"
    ) {
      setStoreStatus(stored);
    }
  }, []);

  const [
    isNotificationsOpen,
    setIsNotificationsOpen,
  ] = useState(false);

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false);

  const topbarRef =
    useRef<HTMLElement | null>(
      null,
    );

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        topbarRef.current &&
        !topbarRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsNotificationsOpen(
          false,
        );

        setIsProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(nextTheme);

    localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme,
    );
  }

  function toggleStoreStatus() {
    const nextStatus: StoreStatus =
      storeStatus === "open"
        ? "closed"
        : "open";

    setStoreStatus(nextStatus);

    localStorage.setItem(
      STORE_STATUS_STORAGE_KEY,
      nextStatus,
    );
  }

  function toggleNotifications() {
    setIsNotificationsOpen(
      (current) => !current,
    );

    setIsProfileOpen(false);
  }

  function toggleProfile() {
    setIsProfileOpen(
      (current) => !current,
    );

    setIsNotificationsOpen(false);
  }

  return (
    <header
      ref={topbarRef}
      className="topbar"
    >
      <div className="topbar__context">
        <span>
          Painel de gestão
        </span>

        <strong>
          Burger House · Unidade
          Centro
        </strong>
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className={`topbar__store-status topbar__store-status--${storeStatus}`}
          onClick={
            toggleStoreStatus
          }
          aria-pressed={
            storeStatus === "open"
          }
        >
          <span />

          {storeStatus === "open"
            ? "Loja aberta"
            : "Loja fechada"}
        </button>

        <button
          type="button"
          className="topbar__theme"
          onClick={toggleTheme}
          aria-label="Alternar tema claro ou escuro"
          title="Alternar tema"
        >
          {theme === "dark" ? (
            <Moon
              size={20}
              weight="bold"
            />
          ) : (
            <Sun
              size={20}
              weight="bold"
            />
          )}
        </button>

        <div className="topbar__dropdown-wrapper">
          <button
            type="button"
            className="topbar__notification"
            aria-label="Notificações"
            onClick={
              toggleNotifications
            }
          >
            <Bell size={20} />

            <span className="topbar__notification-dot" />
          </button>

          {isNotificationsOpen && (
            <div className="topbar-dropdown topbar-dropdown--notifications">
              <div className="topbar-dropdown__header">
                <div>
                  <span>
                    Central de
                    alertas
                  </span>

                  <strong>
                    Notificações
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsNotificationsOpen(
                      false,
                    )
                  }
                  aria-label="Fechar notificações"
                >
                  <X
                    size={18}
                    weight="bold"
                  />
                </button>
              </div>

              <div className="topbar-notifications">
                <article>
                  <span className="topbar-notifications__icon topbar-notifications__icon--warning">
                    !
                  </span>

                  <div>
                    <strong>
                      3 pedidos
                      aguardando
                      confirmação
                    </strong>

                    <span>
                      Verifique a
                      central de
                      pedidos.
                    </span>
                  </div>
                </article>

                <article>
                  <span className="topbar-notifications__icon topbar-notifications__icon--success">
                    <CheckCircle
                      size={17}
                      weight="fill"
                    />
                  </span>

                  <div>
                    <strong>
                      Cozinha em
                      operação
                    </strong>

                    <span>
                      Nenhum pedido
                      crítico no
                      momento.
                    </span>
                  </div>
                </article>

                <article>
                  <span className="topbar-notifications__icon">
                    <Storefront
                      size={17}
                      weight="bold"
                    />
                  </span>

                  <div>
                    <strong>
                      Status da loja
                    </strong>

                    <span>
                      {storeStatus ===
                      "open"
                        ? "A loja está recebendo pedidos."
                        : "A loja está fechada para novos pedidos."}
                    </span>
                  </div>
                </article>
              </div>
            </div>
          )}
        </div>

        <div className="topbar__dropdown-wrapper">
          <button
            type="button"
            className="topbar__profile"
            onClick={
              toggleProfile
            }
            aria-expanded={
              isProfileOpen
            }
          >
            <span className="topbar__avatar">
              DS
            </span>

            <span className="topbar__profile-info">
              <strong>
                Débora Souza
              </strong>

              <small>
                Proprietária
              </small>
            </span>

            <CaretDown
              size={16}
              className={
                isProfileOpen
                  ? "topbar__caret topbar__caret--open"
                  : "topbar__caret"
              }
            />
          </button>

          {isProfileOpen && (
            <div className="topbar-dropdown topbar-dropdown--profile">
              <div className="topbar-profile-menu__identity">
                <span className="topbar__avatar">
                  DS
                </span>

                <div>
                  <strong>
                    Débora Souza
                  </strong>

                  <span>
                    Proprietária
                  </span>
                </div>
              </div>

              <div className="topbar-profile-menu__divider" />

              <button
                type="button"
              >
                <UserCircle
                  size={18}
                />

                Meu perfil
              </button>

              <a
                href="/configuracoes"
              >
                <Gear size={18} />

                Configurações
              </a>

              <div className="topbar-profile-menu__divider" />

              <button
                type="button"
                className="topbar-profile-menu__logout"
              >
                <SignOut
                  size={18}
                />

                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}