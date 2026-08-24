"use client";

import { ReactNode } from "react";

import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell__main">
        <Topbar />

        <main className="dashboard">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}