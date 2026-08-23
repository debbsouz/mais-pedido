import type { ReactNode } from "react";

import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import {
  getOrders,
  toFrontendOrders,
} from "@/lib/orders-dal";

import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrdersProvider } from "@/components/providers/OrdersProvider";
import { TablesProvider } from "@/components/providers/TablesProvider";

interface PanelLayoutProps {
  children: ReactNode;
}

export default async function PanelLayout({
  children,
}: PanelLayoutProps) {
  const user = await requireAuth();

  const subscription =
    await getCurrentSubscription();

  const orders = toFrontendOrders(
    await getOrders(),
  );

  return (
    <AuthProvider
      user={user}
      subscription={subscription}
    >
      <OrdersProvider
        initialOrders={orders}
      >
        <TablesProvider>
          <PanelAccessGuard>
            <AppLayout>
              {children}
            </AppLayout>
          </PanelAccessGuard>
        </TablesProvider>
      </OrdersProvider>
    </AuthProvider>
  );
}