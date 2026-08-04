"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPieSlice,
  ClipboardText,
  ForkKnife,
  Table,
  CookingPot,
  Motorcycle,
  Users,
  CurrencyCircleDollar,
  ChartBar,
  Gear,
  SignOut,
  Plus,
} from "@phosphor-icons/react";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: ChartPieSlice,
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: ClipboardText,
  },
  {
    label: "Cardápio",
    href: "/cardapio",
    icon: ForkKnife,
  },
  {
    label: "Mesas",
    href: "/mesas",
    icon: Table,
  },
  {
    label: "Cozinha",
    href: "/cozinha",
    icon: CookingPot,
  },
  {
    label: "Entregas",
    href: "/entregas",
    icon: Motorcycle,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: CurrencyCircleDollar,
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: ChartBar,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Image
          src="/logo-mais-pedido.png"
          alt="Logo do +Pedido"
          width={170}
          height={54}
          priority
          className="sidebar__brand-image"
        />
      </div>

      <div className="sidebar__restaurant">
        <div className="sidebar__restaurant-logo">BH</div>

        <div>
          <strong>Burger House</strong>
          <span>Unidade Centro</span>
        </div>
      </div>

      <Link href="/pedidos/novo" className="sidebar__new-order">
        <Plus size={20} weight="bold" />
        <span>Novo pedido</span>
      </Link>

      <nav className="sidebar__navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__item ${
                isActive ? "sidebar__item--active" : ""
              }`}
            >
              <Icon size={21} weight={isActive ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <Link href="/configuracoes" className="sidebar__item">
          <Gear size={21} />
          <span>Configurações</span>
        </Link>

        <button type="button" className="sidebar__item sidebar__logout">
          <SignOut size={21} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}