import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onNewWorkOrder?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  onNewWorkOrder
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col lg:flex-row">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onNewWorkOrder={onNewWorkOrder}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
