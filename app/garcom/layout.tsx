import type { ReactNode } from "react";

import { OrdersProvider } from "@/components/providers/OrdersProvider";
import { TablesProvider } from "@/components/providers/TablesProvider";

interface WaiterLayoutProps {
  children: ReactNode;
}

export default function WaiterLayout({
  children,
}: WaiterLayoutProps) {
  return (
    <OrdersProvider>
      <TablesProvider>
        {children}
      </TablesProvider>
    </OrdersProvider>
  );
}