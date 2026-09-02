import type { ReactNode } from "react";

import {
  getCurrentSubscription,
  requireAuth,
} from "@/lib/dal";

import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/components/providers/AuthProvider";

interface RelatoriosLayoutProps {
  children: ReactNode;
}

export default async function RelatoriosLayout({
  children,
}: RelatoriosLayoutProps) {
  const user = await requireAuth();

  const subscription =
    await getCurrentSubscription();

  return (
    <AuthProvider
      user={user}
      subscription={subscription}
    >
      <PanelAccessGuard>
        <AppLayout>
          {children}
        </AppLayout>
      </PanelAccessGuard>
    </AuthProvider>
  );
}
