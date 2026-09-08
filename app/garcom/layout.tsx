import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrdersProvider } from "@/components/providers/OrdersProvider";
import { TablesProvider } from "@/components/providers/TablesProvider";
import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";

import { getOrders, toFrontendOrders } from "@/lib/orders-dal";
import { getRestaurantTables } from "@/lib/tables-dal";

interface WaiterLayoutProps {
  children: React.ReactNode;
}

export default async function WaiterLayout({
  children,
}: WaiterLayoutProps) {
  const user = await requireAuth();
  const subscription = await getCurrentSubscription();
  const orders = toFrontendOrders(await getOrders());
  const tables = await getRestaurantTables();

  return (
    <AuthProvider
      user={user}
      subscription={subscription}
    >
      <OrdersProvider initialOrders={orders}>
        <TablesProvider initialTables={tables}>
          <PanelAccessGuard>
            {children}
          </PanelAccessGuard>
        </TablesProvider>
      </OrdersProvider>
    </AuthProvider>
  );
}