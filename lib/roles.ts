export type UserRole =
  | "owner"
  | "manager"
  | "attendant"
  | "waiter"
  | "kitchen"
  | "delivery";

export type PermissionId =
  | "viewDashboard"
  | "viewOrders"
  | "createOrders"
  | "manageOrders"
  | "viewTables"
  | "manageTables"
  | "viewKitchen"
  | "manageKitchen"
  | "viewDeliveries"
  | "manageDeliveries"
  | "viewMenu"
  | "manageMenu"
  | "viewCustomers"
  | "manageCustomers"
  | "viewFinancial"
  | "viewReports"
  | "viewSettings"
  | "manageUsers";

export interface RoleDefinition {
  id: UserRole;
  name: string;
  permissions: PermissionId[];
}

export const roles: Record<UserRole, RoleDefinition> = {
  owner: {
    id: "owner",
    name: "Proprietário",
    permissions: [
      "viewDashboard",
      "viewOrders",
      "createOrders",
      "manageOrders",
      "viewTables",
      "manageTables",
      "viewKitchen",
      "manageKitchen",
      "viewDeliveries",
      "manageDeliveries",
      "viewMenu",
      "manageMenu",
      "viewCustomers",
      "manageCustomers",
      "viewFinancial",
      "viewReports",
      "viewSettings",
      "manageUsers",
    ],
  },

  manager: {
    id: "manager",
    name: "Gerente",
    permissions: [
      "viewDashboard",
      "viewOrders",
      "createOrders",
      "manageOrders",
      "viewTables",
      "manageTables",
      "viewKitchen",
      "manageKitchen",
      "viewDeliveries",
      "manageDeliveries",
      "viewMenu",
      "manageMenu",
      "viewCustomers",
      "manageCustomers",
      "viewFinancial",
      "viewReports",
    ],
  },

  attendant: {
    id: "attendant",
    name: "Atendente",
    permissions: [
      "viewOrders",
      "createOrders",
      "manageOrders",
      "viewTables",
      "manageTables",
      "viewCustomers",
      "manageCustomers",
    ],
  },

  waiter: {
    id: "waiter",
    name: "Garçom",
    permissions: [
      "createOrders",
      "viewTables",
      "manageTables",
    ],
  },

  kitchen: {
    id: "kitchen",
    name: "Cozinha",
    permissions: [
      "viewKitchen",
      "manageKitchen",
    ],
  },

  delivery: {
    id: "delivery",
    name: "Entregador",
    permissions: [
      "viewDeliveries",
      "manageDeliveries",
    ],
  },
};

export function roleHasPermission(
  role: UserRole,
  permission: PermissionId,
) {
  return roles[role].permissions.includes(permission);
}