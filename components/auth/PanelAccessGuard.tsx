"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useCurrentUser } from "@/components/providers/AuthProvider";
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
  const currentUser = useCurrentUser();

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
    currentUser.role,
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