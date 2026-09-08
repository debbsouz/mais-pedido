import type { ReactNode } from "react";

import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import { getOrders, toFrontendOrders } from "@/lib/orders-dal";

import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrdersProvider } from "@/components/providers/OrdersProvider";

interface CardapioLayoutProps {
  children: ReactNode;
}

export default async function CardapioLayout({
  children,
}: CardapioLayoutProps) {
  const user = await requireAuth();

  const subscription =
    await getCurrentSubscription();

  const orders = toFrontendOrders(await getOrders());

  return (
    <AuthProvider
      user={user}
      subscription={subscription}
    >
      <OrdersProvider initialOrders={orders}>
        <PanelAccessGuard>
          <AppLayout>
            {children}
          </AppLayout>
        </PanelAccessGuard>
      </OrdersProvider>
    </AuthProvider>
  );
}