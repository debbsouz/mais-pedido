import type { ReactNode } from "react";

import { AppLayout } from "@/components/layout/AppLayout";

interface PanelLayoutProps {
  children: ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}