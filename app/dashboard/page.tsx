"use client";

import { DashboardAlert } from "@/components/dashboard/DashboardAlert";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { OperationPanel } from "@/components/dashboard/OperationPanel";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { AppLayout } from "@/components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardHeader />

      <DashboardStats />

      <DashboardAlert />

      <section className="dashboard__grid">
        <OperationPanel />
        <RecentOrders />
      </section>
    </AppLayout>
  );
}