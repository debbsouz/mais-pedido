import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrdersProvider } from "@/components/providers/OrdersProvider";
import { TablesProvider } from "@/components/providers/TablesProvider";
import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";
import { AppLayout } from "@/components/layout/AppLayout";

interface PanelLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout do painel operacional.
 *
 * 1. requireAuth() — busca a sessao no servidor; sem sessao → redirect /login.
 * 2. AuthProvider — hidrata os Client Components com dados reais do usuario.
 * 3. PanelAccessGuard — redireciona por permissao de cargo (client-side).
 */
export default async function PanelLayout({
  children,
}: PanelLayoutProps) {
  const user = await requireAuth();
  const subscription = await getCurrentSubscription();

  return (
    <AuthProvider user={user} subscription={subscription}>
      <OrdersProvider>
        <TablesProvider>
          <PanelAccessGuard>
            <AppLayout>{children}</AppLayout>
          </PanelAccessGuard>
        </TablesProvider>
      </OrdersProvider>
    </AuthProvider>
  );
}