import type { FeatureId } from "./plans";
import type {
  PermissionId,
  UserRole,
} from "./roles";

export interface ProtectedRoute {
  path: string;
  permission: PermissionId;
  /**
   * Recurso do plano exigido pra essa rota — mesmo mapeamento que
   * já existe no Sidebar (item.feature). Sem isso, a rota fica
   * liberada pra qualquer plano (ex.: Início, Pedidos).
   */
  feature?: FeatureId;
}

export const protectedRoutes: ProtectedRoute[] = [
  {
    path: "/inicio",
    permission: "viewDashboard",
  },
  {
    path: "/dashboard",
    permission: "viewDashboard",
  },
  {
    path: "/pedidos",
    permission: "viewOrders",
  },
  {
    path: "/mesas",
    permission: "viewTables",
    feature: "tables",
  },
  {
    path: "/cozinha",
    permission: "viewKitchen",
    feature: "kitchenDisplay",
  },
  {
    path: "/entregas",
    permission: "viewDeliveries",
    feature: "delivery",
  },
  {
    path: "/cardapio",
    permission: "viewMenu",
    feature: "digitalMenu",
  },
  {
    path: "/clientes",
    permission: "viewCustomers",
  },
  {
    path: "/financeiro",
    permission: "viewFinancial",
    feature: "financial",
  },
  {
    path: "/relatorios",
    permission: "viewReports",
  },
  {
    path: "/configuracoes",
    permission: "viewSettings",
  },
  {
    path: "/garcom",
    permission: "viewTables",
    feature: "waiter",
  },
  {
    path: "/atendente",
    permission: "viewOrders",
    feature: "frontDesk",
  },
];

export const roleHomeRoutes: Record<
  UserRole,
  string
> = {
  owner: "/inicio",
  manager: "/inicio",
  attendant: "/pedidos",
  waiter: "/mesas",
  kitchen: "/cozinha",
  delivery: "/entregas",
};

function findProtectedRoute(
  pathname: string,
) {
  return protectedRoutes.find(
    (item) =>
      pathname === item.path ||
      pathname.startsWith(
        `${item.path}/`,
      ),
  );
}

export function getRoutePermission(
  pathname: string,
) {
  return findProtectedRoute(pathname)?.permission ?? null;
}

export function getRouteFeature(
  pathname: string,
) {
  return findProtectedRoute(pathname)?.feature ?? null;
}