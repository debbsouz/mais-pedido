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
import {
  roleHasPermission,
  roles,
  type PermissionId,
} from "@/lib/roles";
import {
  useCurrentUser,
  useCurrentSubscription,
} from "@/components/providers/AuthProvider";
import { signOut } from "@/app/actions/auth";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof House;
  feature?: FeatureId;
  permission?: PermissionId;
};

const operationNavigation: NavigationItem[] = [
  {
    label: "Início",
    href: "/inicio",
    icon: House,
    permission: "viewDashboard",
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: ClipboardText,
    permission: "viewOrders",
  },
  {
    label: "Mesas",
    href: "/mesas",
    icon: Table,
    feature: "tables",
    permission: "viewTables",
  },
  {
    label: "Cozinha",
    href: "/cozinha",
    icon: CookingPot,
    feature: "kitchenDisplay",
    permission: "viewKitchen",
  },
  {
    label: "Entregas",
    href: "/entregas",
    icon: Motorcycle,
    feature: "delivery",
    permission: "viewDeliveries",
  },
];

const managementNavigation: NavigationItem[] = [
  {
    label: "Cardápio",
    href: "/cardapio",
    icon: ForkKnife,
    feature: "digitalMenu",
    permission: "viewMenu",
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    permission: "viewCustomers",
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: CurrencyCircleDollar,
    feature: "financial",
    permission: "viewFinancial",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: ChartPieSlice,
    permission: "viewDashboard",
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: ChartBar,
    permission: "viewReports",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const currentSubscription = useCurrentSubscription();

  const currentPlan =
    plans[currentSubscription.planId];

  const currentRole =
    roles[currentUser.role];

  const canCreateOrders =
    roleHasPermission(
      currentUser.role,
      "createOrders",
    );

  const canViewSettings =
    roleHasPermission(
      currentUser.role,
      "viewSettings",
    );

  function renderNavigationItem(
    item: NavigationItem,
  ) {
    const Icon = item.icon;

    const hasRolePermission =
      item.permission === undefined ||
      roleHasPermission(
        currentUser.role,
        item.permission,
      );

    /*
     * Se o cargo não tiver permissão,
     * o funcionário nem vê o item.
     */
    if (!hasRolePermission) {
      return null;
    }

    const isActive =
      pathname === item.href ||
      pathname.startsWith(
        `${item.href}/`,
      );

    const isLockedByPlan =
      item.feature !== undefined &&
      !hasFeature(
        currentSubscription.planId,
        item.feature,
      );

    /*
     * Recursos bloqueados pelo plano
     * só aparecem como upgrade para
     * proprietário e gerente.
     */
    if (isLockedByPlan) {
      const canSeeUpgrade =
        currentUser.role === "owner" ||
        currentUser.role === "manager";

      if (!canSeeUpgrade) {
        return null;
      }

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
            <LockKey
              size={12}
              weight="bold"
            />
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
            isActive
              ? "fill"
              : "regular"
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

          <span>
            Unidade Centro
          </span>

          <small className="sidebar__plan">
            Plano {currentPlan.name}
          </small>

          <small className="sidebar__role">
            {currentRole.name}
          </small>
        </div>
      </div>

      {canCreateOrders && (
        <Link
          href="/pedidos"
          className="sidebar__new-order"
        >
          <Plus
            size={20}
            weight="bold"
          />

          <span>Novo pedido</span>
        </Link>
      )}

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
        {canViewSettings && (
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
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="sidebar__item sidebar__logout"
          >
            <SignOut size={21} />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </aside>
  );
}