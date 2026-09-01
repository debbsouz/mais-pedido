"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  {
    href: "/configuracoes/cardapio-digital",
    label: "Cardápio Digital",
  },
  {
    href: "/configuracoes/identidade-visual",
    label: "Identidade Visual",
  },
  {
    href: "/configuracoes/pagamentos",
    label: "Pagamentos",
  },
  {
    href: "/configuracoes/estabelecimento",
    label: "Estabelecimento",
  },
  {
    href: "/configuracoes/equipe",
    label: "Equipe",
  },
  {
    href: "/configuracoes/plano",
    label: "Plano",
  },
];

export default function ConfiguracoesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <section className="settings-page">
      <header className="settings-page__header">
        <span>Gestão da unidade</span>
        <h1>Configurações</h1>
      </header>

      <nav className="settings-tabbar">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`settings-tabbar__tab${
              pathname === tab.href
                ? " settings-tabbar__tab--active"
                : ""
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="settings-content">
        {children}
      </div>
    </section>
  );
}
