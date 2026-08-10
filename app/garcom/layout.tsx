import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrdersProvider } from "@/components/providers/OrdersProvider";
import { TablesProvider } from "@/components/providers/TablesProvider";
import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";

interface WaiterLayoutProps {
  children: React.ReactNode;
}

export default async function WaiterLayout({
  children,
}: WaiterLayoutProps) {
  const user = await requireAuth();
  const subscription = await getCurrentSubscription();

  return (
    <AuthProvider
      user={user}
      subscription={subscription}
    >
      <OrdersProvider>
        <TablesProvider>
          <PanelAccessGuard>
            {children}
          </PanelAccessGuard>
        </TablesProvider>
      </OrdersProvider>
    </AuthProvider>
  );
}