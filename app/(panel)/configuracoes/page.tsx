"use client";

import {
  Buildings,
  CaretRight,
  Crown,
  ImageSquare,
  QrCode,
  Storefront,
  UsersThree,
} from "@phosphor-icons/react";
import Link from "next/link";

const settingsMenu = [
  {
    href: "/configuracoes/estabelecimento",
    icon: Buildings,
    title: "Estabelecimento",
    description:
      "Nome, CNPJ, endereço e telefone.",
    badge: "Em breve",
  },
  {
    href: "/configuracoes/cardapio-digital",
    icon: Storefront,
    title: "Cardápio Digital",
    description:
      "Link da loja pública, pedido mínimo e redes sociais.",
    badge: null,
  },
  {
    href: "/configuracoes/identidade-visual",
    icon: ImageSquare,
    title: "Identidade visual",
    description: "Logo e banner da sua loja.",
    badge: "Em breve",
  },
  {
    href: "/configuracoes/pagamentos",
    icon: QrCode,
    title: "Pagamentos",
    description:
      "Pix e bandeiras aceitas na entrega.",
    badge: null,
  },
  {
    href: "/configuracoes/equipe",
    icon: UsersThree,
    title: "Equipe",
    description:
      "Contas de acesso para cozinha, garçom e mais.",
    badge: "Em breve",
  },
  {
    href: "/configuracoes/plano",
    icon: Crown,
    title: "Plano",
    description: "Sua assinatura do +Pedido.",
    badge: null,
  },
];

export default function ConfiguracoesPage() {
  return (
    <section className="settings-page">
      <header className="settings-page__header">
        <span>Gestão da unidade</span>
        <h1>Configurações</h1>
        <p>Escolha o que você quer ajustar.</p>
      </header>

      <nav className="settings-menu">
        {settingsMenu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="settings-menu__item"
            >
              <span className="settings-menu__icon">
                <Icon
                  size={20}
                  weight="bold"
                />
              </span>

              <span className="settings-menu__text">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>

              {item.badge && (
                <span className="settings-menu__badge">
                  {item.badge}
                </span>
              )}

              <CaretRight
                size={16}
                weight="bold"
                className="settings-menu__chevron"
              />
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
