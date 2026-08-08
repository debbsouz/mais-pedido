import type { UserRole } from "./roles";

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
}

export const currentUser: CurrentUser = {
  id: "user-demo-001",
  name: "Débora Souza",
  role: "owner",
};