import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
