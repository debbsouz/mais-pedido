"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { currentUser } from "@/lib/current-user";
import {
  getRoutePermission,
  roleHomeRoutes,
} from "@/lib/route-access";
import { roleHasPermission } from "@/lib/roles";

interface PanelAccessGuardProps {
  children: React.ReactNode;
}

export function PanelAccessGuard({
  children,
}: PanelAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const requiredPermission =
    getRoutePermission(pathname);

  const hasAccess =
    requiredPermission === null ||
    roleHasPermission(
      currentUser.role,
      requiredPermission,
    );

  useEffect(() => {
    if (hasAccess) {
      return;
    }

    router.replace(
      roleHomeRoutes[currentUser.role],
    );
  }, [
    hasAccess,
    router,
  ]);

  if (!hasAccess) {
    return (
      <div className="panel-access-loading">
        <span>Redirecionando...</span>
      </div>
    );
  }

  return <>{children}</>;
}