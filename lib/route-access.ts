import type {
  PermissionId,
  UserRole,
} from "./roles";

export interface ProtectedRoute {
  path: string;
  permission: PermissionId;
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
  },
  {
    path: "/cozinha",
    permission: "viewKitchen",
  },
  {
    path: "/entregas",
    permission: "viewDeliveries",
  },
  {
    path: "/cardapio",
    permission: "viewMenu",
  },
  {
    path: "/clientes",
    permission: "viewCustomers",
  },
  {
    path: "/financeiro",
    permission: "viewFinancial",
  },
  {
    path: "/relatorios",
    permission: "viewReports",
  },
  {
    path: "/configuracoes",
    permission: "viewSettings",
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

export function getRoutePermission(
  pathname: string,
) {
  const route = protectedRoutes.find(
    (item) =>
      pathname === item.path ||
      pathname.startsWith(
        `${item.path}/`,
      ),
  );

  return route?.permission ?? null;
}