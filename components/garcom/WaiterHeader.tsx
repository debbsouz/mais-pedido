"use client";

import { UserCircle } from "@phosphor-icons/react";

import { useCurrentUser } from "@/components/providers/AuthProvider";
import { roles } from "@/lib/roles";

export function WaiterHeader() {
  const currentUser = useCurrentUser();
  const currentRole = roles[currentUser.role];

  return (
    <header className="waiter-header">
      <div>
        <span className="waiter-header__brand">
          +Pedido
        </span>

        <strong>{currentUser.organizationName}</strong>
      </div>

      <div className="waiter-header__actions">
        <div className="waiter-header__user">
          <UserCircle size={30} />

          <div>
            <strong>{currentUser.name}</strong>
            <span>{currentRole.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}