import type { ReactNode } from "react";

import { PanelAccessGuard } from "@/components/auth/PanelAccessGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { OrdersProvider } from "@/components/providers/OrdersProvider";

interface PanelLayoutProps {
  children: ReactNode;
}

export default function PanelLayout({
  children,
}: PanelLayoutProps) {
  return (
    <OrdersProvider>
      <PanelAccessGuard>
        <AppLayout>
          {children}
        </AppLayout>
      </PanelAccessGuard>
    </OrdersProvider>
  );
}