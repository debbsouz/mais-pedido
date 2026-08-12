import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrdersProvider } from "@/components/providers/OrdersProvider";
import { TablesProvider } from "@/components/providers/TablesProvider";
import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";

import { getOrders, toFrontendOrders } from "@/lib/orders-dal";

interface AttendantLayoutProps {
  children: React.ReactNode;
}

export default async function AttendantLayout({
  children,
}: AttendantLayoutProps) {
  const user = await requireAuth();
  const subscription = await getCurrentSubscription();
  const orders = toFrontendOrders(await getOrders());

  return (
    <AuthProvider
      user={user}
      subscription={subscription}
    >
      <OrdersProvider initialOrders={orders}>
        <TablesProvider>
          <PanelAccessGuard>
            {children}
          </PanelAccessGuard>
        </TablesProvider>
      </OrdersProvider>
    </AuthProvider>
  );
}