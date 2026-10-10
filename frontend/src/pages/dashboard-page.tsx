import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricsOverviewCards } from "@/components/modules/dashboard/metrics-overview-cards";
import { RevenueAndVolumeChart } from "@/components/modules/dashboard/revenue-and-volume-chart";
import { VehicleCategoryDonutChart } from "@/components/modules/dashboard/vehicle-category-donut-chart";
import { LiveBoxesStatusGrid } from "@/components/modules/dashboard/live-boxes-status-grid";
import { RecentWorkOrdersTable } from "@/components/modules/dashboard/recent-work-orders-table";
import { QuickCheckInModal } from "@/components/modules/dashboard/quick-check-in-modal";
import { useDashboardData } from "@/services/queries/use-dashboard-data";

interface DashboardPageProps {
  isCheckInModalOpen: boolean;
  onCloseCheckInModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  isCheckInModalOpen,
  onCloseCheckInModal
}) => {
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-red-500/20 bg-red-500/5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4 border border-red-500/30">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Falha ao carregar dados do Dashboard
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          {error instanceof Error ? error.message : "Não foi possível conectar à API de produção."}
        </p>
        <Button
          onClick={() => refetch()}
          className="gap-2 bg-sky-500 hover:bg-sky-600 text-white"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        <MetricsOverviewCards metrics={data?.metrics} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueAndVolumeChart data={data?.chartData} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <VehicleCategoryDonutChart
              data={data?.categoryDistribution}
              isLoading={isLoading}
            />
          </div>
        </div>

        <LiveBoxesStatusGrid
          boxes={data?.boxes}
          workOrders={data?.recentWorkOrders}
          isLoading={isLoading}
        />

        <RecentWorkOrdersTable
          workOrders={data?.recentWorkOrders}
          isLoading={isLoading}
        />
      </div>

      <QuickCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={onCloseCheckInModal}
      />
    </>
  );
};
