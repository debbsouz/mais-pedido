"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChartBar,
  ChartPieSlice,
  ClipboardText,
  CookingPot,
  CurrencyCircleDollar,
  ForkKnife,
  Gear,
  House,
  LockKey,
  Motorcycle,
  Plus,
  SignOut,
  Table,
  Users,
} from "@phosphor-icons/react";

import { hasFeature } from "@/lib/access";
import {
  plans,
  type FeatureId,
} from "@/lib/plans";
import { currentSubscription } from "@/lib/subscription";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof House;
  feature?: FeatureId;
};

const operationNavigation: NavigationItem[] = [
  {
    label: "Início",
    href: "/inicio",
    icon: House,
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: ClipboardText,
  },
  {
    label: "Mesas",
    href: "/mesas",
    icon: Table,
    feature: "tables",
  },
  {
    label: "Cozinha",
    href: "/cozinha",
    icon: CookingPot,
    feature: "kitchenDisplay",
  },
  {
    label: "Entregas",
    href: "/entregas",
    icon: Motorcycle,
    feature: "delivery",
  },
];

const managementNavigation: NavigationItem[] = [
  {
    label: "Cardápio",
    href: "/cardapio",
    icon: ForkKnife,
    feature: "digitalMenu",
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
    feature: "financial",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: ChartPieSlice,
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: ChartBar,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const currentPlan =
    plans[currentSubscription.planId];

  function renderNavigationItem(
    item: NavigationItem,
  ) {
    const Icon = item.icon;

    const isActive =
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`);

    const isLocked =
      item.feature !== undefined &&
      !hasFeature(item.feature);

    if (isLocked) {
      return (
        <div
          key={item.href}
          className="sidebar__item sidebar__item--locked"
          title="Disponível em um plano superior"
          aria-disabled="true"
        >
          <Icon size={21} />

          <span>{item.label}</span>

          <span className="sidebar__upgrade">
            <LockKey size={12} weight="bold" />
            Upgrade
          </span>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`sidebar__item ${
          isActive
            ? "sidebar__item--active"
            : ""
        }`}
      >
        <Icon
          size={21}
          weight={
            isActive ? "fill" : "regular"
          }
        />

        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Image
          src="/logo-mais-pedido.png"
          alt="+Pedido"
          width={150}
          height={44}
          priority
        />
      </div>

      <div className="sidebar__restaurant">
        <div className="sidebar__restaurant-logo">
          BH
        </div>

        <div className="sidebar__restaurant-info">
          <strong>Burger House</strong>
          <span>Unidade Centro</span>

          <small className="sidebar__plan">
            Plano {currentPlan.name}
          </small>
        </div>
      </div>

      <Link
        href="/pedidos"
        className="sidebar__new-order"
      >
        <Plus size={20} weight="bold" />
        <span>Novo pedido</span>
      </Link>

      <nav className="sidebar__navigation">
        <div className="sidebar__group">
          <span className="sidebar__group-title">
            Operação
          </span>

          {operationNavigation.map(
            renderNavigationItem,
          )}
        </div>

        <div className="sidebar__group">
          <span className="sidebar__group-title">
            Gestão
          </span>

          {managementNavigation.map(
            renderNavigationItem,
          )}
        </div>
      </nav>

      <div className="sidebar__footer">
        <Link
          href="/configuracoes"
          className={`sidebar__item ${
            pathname.startsWith(
              "/configuracoes",
            )
              ? "sidebar__item--active"
              : ""
          }`}
        >
          <Gear size={21} />
          <span>Configurações</span>
        </Link>

        <button
          type="button"
          className="sidebar__item sidebar__logout"
        >
          <SignOut size={21} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}