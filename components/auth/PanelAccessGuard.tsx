"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  useCurrentSubscription,
  useCurrentUser,
} from "@/components/providers/AuthProvider";
import { hasFeature } from "@/lib/access";
import {
  getRouteFeature,
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
  const subscription = useCurrentSubscription();

  const requiredPermission =
    getRoutePermission(pathname);

  const requiredFeature =
    getRouteFeature(pathname);

  const hasAccess =
    (requiredPermission === null ||
      roleHasPermission(
        currentUser.role,
        requiredPermission,
      )) &&
    (requiredFeature === null ||
      hasFeature(
        subscription.planId,
        requiredFeature,
      ));

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