import type { ReactNode } from "react";

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
      <AppLayout>{children}</AppLayout>
    </OrdersProvider>
  );
}