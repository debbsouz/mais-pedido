import type { ReactNode } from "react";

import { OrdersProvider } from "@/components/providers/OrdersProvider";
import { TablesProvider } from "@/components/providers/TablesProvider";

interface AttendantLayoutProps {
  children: ReactNode;
}

export default function AttendantLayout({
  children,
}: AttendantLayoutProps) {
  return (
    <OrdersProvider>
      <TablesProvider>
        {children}
      </TablesProvider>
    </OrdersProvider>
  );
}