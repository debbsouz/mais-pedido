"use client";

import {
  Bell,
  CaretDown,
  Moon,
  Sun,
} from "@phosphor-icons/react";
import { useEffect } from "react";

const THEME_STORAGE_KEY = "mais-pedido-theme";

type Theme = "light" | "dark";

export function Topbar() {
  useEffect(() => {
    const savedTheme =
      localStorage.getItem(THEME_STORAGE_KEY);

    const theme: Theme =
      savedTheme === "dark"
        ? "dark"
        : "light";

    document.documentElement.dataset.theme =
      theme;
  }, []);

  function toggleTheme() {
    const currentTheme: Theme =
      document.documentElement.dataset.theme ===
      "dark"
        ? "dark"
        : "light";

    const nextTheme: Theme =
      currentTheme === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme =
      nextTheme;

    localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme,
    );
  }

  return (
    <header className="topbar">
      <div className="topbar__context">
        <span>Painel de gestão</span>

        <strong>
          Burger House · Unidade Centro
        </strong>
      </div>

      <div className="topbar__actions">
        <div className="topbar__store-status">
          <span />
          Loja aberta
        </div>

        <button
          type="button"
          className="topbar__theme"
          onClick={toggleTheme}
          aria-label="Alternar tema claro ou escuro"
          title="Alternar tema"
        >
          <Sun
            className="topbar__theme-sun"
            size={20}
            weight="bold"
          />

          <Moon
            className="topbar__theme-moon"
            size={20}
            weight="bold"
          />
        </button>

        <button
          type="button"
          className="topbar__notification"
          aria-label="Notificações"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="topbar__profile"
        >
          <span className="topbar__avatar">
            DS
          </span>

          <span className="topbar__profile-info">
            <strong>Débora Souza</strong>
            <small>Proprietária</small>
          </span>

          <CaretDown size={16} />
        </button>
      </div>
    </header>
  );
}