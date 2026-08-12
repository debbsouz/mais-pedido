import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";

interface CardapioLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout da rota /cardapio.
 *
 * A rota vive fora do route group (panel), entao precisa do mesmo
 * trinco de seguranca do painel:
 *
 * 1. requireAuth() — sem sessao → redirect /login.
 * 2. AuthProvider — hidrata os Client Components com dados reais do usuario.
 * 3. PanelAccessGuard — redireciona por permissao de cargo (client-side);
 *    viewMenu → owner/manager. Waiter/attendant sao redirecionados para
 *    a home do cargo deles.
 */
export default async function CardapioLayout({
  children,
}: CardapioLayoutProps) {
  const user = await requireAuth();
  const subscription = await getCurrentSubscription();

  return (
    <AuthProvider user={user} subscription={subscription}>
      <PanelAccessGuard>{children}</PanelAccessGuard>
    </AuthProvider>
  );
}
