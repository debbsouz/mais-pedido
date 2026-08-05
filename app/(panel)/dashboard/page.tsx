"use client";

import { OperationAlert } from "@/components/inicio/OperationAlert";
import { OperationHeader } from "@/components/inicio/OperationHeader";
import { OperationPanel } from "@/components/inicio/OperationPanel";
import { OperationStats } from "@/components/inicio/OperationStats";
import { RecentOrders } from "@/components/inicio/RecentOrders";

export default function DashboardPage() {
  return (
    <>
      <OperationHeader />

      <OperationStats />

      <OperationAlert />

      <section className="dashboard__grid">
        <OperationPanel />
        <RecentOrders />
      </section>
    </>
  );
}