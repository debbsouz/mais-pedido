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
  useSyncExternalStore,
} from "react";

const THEME_STORAGE_KEY =
  "mais-pedido-theme";

const STORE_STATUS_STORAGE_KEY =
  "mais-pedido-store-status";

const THEME_CHANGE_EVENT =
  "mais-pedido-theme-change";

const STORE_STATUS_CHANGE_EVENT =
  "mais-pedido-store-status-change";

type Theme = "light" | "dark";

type StoreStatus =
  | "open"
  | "closed";

/* =========================================
   THEME STORAGE
========================================= */

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored =
    localStorage.getItem(
      THEME_STORAGE_KEY,
    );

  return stored === "dark"
    ? "dark"
    : "light";
}

function getThemeServerSnapshot(): Theme {
  return "light";
}

function subscribeTheme(
  callback: () => void,
) {
  function handleStorage(
    event: StorageEvent,
  ) {
    if (
      event.key ===
      THEME_STORAGE_KEY
    ) {
      callback();
    }
  }

  window.addEventListener(
    "storage",
    handleStorage,
  );

  window.addEventListener(
    THEME_CHANGE_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage,
    );

    window.removeEventListener(
      THEME_CHANGE_EVENT,
      callback,
    );
  };
}

/* =========================================
   STORE STATUS STORAGE
========================================= */

function getStoreStatusSnapshot():
  StoreStatus {
  if (typeof window === "undefined") {
    return "open";
  }

  const stored =
    localStorage.getItem(
      STORE_STATUS_STORAGE_KEY,
    );

  return stored === "closed"
    ? "closed"
    : "open";
}

function getStoreStatusServerSnapshot():
  StoreStatus {
  return "open";
}

function subscribeStoreStatus(
  callback: () => void,
) {
  function handleStorage(
    event: StorageEvent,
  ) {
    if (
      event.key ===
      STORE_STATUS_STORAGE_KEY
    ) {
      callback();
    }
  }

  window.addEventListener(
    "storage",
    handleStorage,
  );

  window.addEventListener(
    STORE_STATUS_CHANGE_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage,
    );

    window.removeEventListener(
      STORE_STATUS_CHANGE_EVENT,
      callback,
    );
  };
}

export function Topbar() {
  const theme =
    useSyncExternalStore(
      subscribeTheme,
      getThemeSnapshot,
      getThemeServerSnapshot,
    );

  const storeStatus =
    useSyncExternalStore(
      subscribeStoreStatus,
      getStoreStatusSnapshot,
      getStoreStatusServerSnapshot,
    );

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

  /* =========================================
     SINCRONIZA TEMA COM O HTML
  ========================================= */

  useEffect(() => {
    document.documentElement.dataset.theme =
      theme;
  }, [theme]);

  /* =========================================
     FECHAR DROPDOWNS AO CLICAR FORA
  ========================================= */

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

  /* =========================================
     AÇÕES
  ========================================= */

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme,
    );

    document.documentElement.dataset.theme =
      nextTheme;

    window.dispatchEvent(
      new Event(
        THEME_CHANGE_EVENT,
      ),
    );
  }

  function toggleStoreStatus() {
    const nextStatus: StoreStatus =
      storeStatus === "open"
        ? "closed"
        : "open";

    localStorage.setItem(
      STORE_STATUS_STORAGE_KEY,
      nextStatus,
    );

    window.dispatchEvent(
      new Event(
        STORE_STATUS_CHANGE_EVENT,
      ),
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
                    Central de alertas
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

              <button type="button">
                <UserCircle
                  size={18}
                />

                Meu perfil
              </button>

              <a href="/configuracoes">
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