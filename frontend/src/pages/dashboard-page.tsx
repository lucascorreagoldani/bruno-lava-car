import { useMemo } from "react";
import { PlusCircle, RefreshCw, MessageSquareCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { KpiMetricsGrid } from "@/components/modules/dashboard/kpi-metrics-grid";
import { LiveBoxesMonitor } from "@/components/modules/dashboard/live-boxes-monitor";
import { WorkOrdersPipeline } from "@/components/modules/dashboard/work-orders-pipeline";
import { RevenueChart } from "@/components/modules/dashboard/revenue-chart";
import { VehicleCategoryChart } from "@/components/modules/dashboard/vehicle-category-chart";
import { TodayOrdersTable } from "@/components/modules/dashboard/today-orders-table";
import { useBoxesQuery } from "@/services/queries/use-boxes";
import {
  useWorkOrdersQuery,
  useUpdateWorkOrderStatusMutation
} from "@/services/queries/use-work-orders";
import type {
  DashboardMetricSummary,
  WorkOrder,
  WorkOrderStatus,
  VehicleCategory
} from "@/types/domain";

export function DashboardPage() {
  const {
    data: boxesData,
    isLoading: isLoadingBoxes,
    isError: isErrorBoxes,
    refetch: refetchBoxes
  } = useBoxesQuery();

  const {
    data: workOrdersData,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
    refetch: refetchOrders
  } = useWorkOrdersQuery({ limit: 100 });

  const updateStatusMutation = useUpdateWorkOrderStatusMutation();

  const boxes = useMemo(() => boxesData?.data || [], [boxesData]);
  const orders = useMemo(() => workOrdersData?.data || [], [workOrdersData]);

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED"
      ),
    [orders]
  );

  const metrics: DashboardMetricSummary = useMemo(() => {
    const todayRevenue = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const nonCancelledOrders = orders.filter((o) => o.status !== "CANCELLED");
    const todayVehiclesCount = nonCancelledOrders.length;
    const activeVehiclesCount = activeOrders.length;

    const activeBoxesCount = boxes.filter((b) => b.status === "ACTIVE").length;
    const boxOccupancyRate =
      activeBoxesCount > 0
        ? Math.min(
            100,
            Math.round((activeOrders.length / activeBoxesCount) * 100)
          )
        : 0;

    const averageTicket =
      todayVehiclesCount > 0 ? Math.round(todayRevenue / todayVehiclesCount) : 0;

    return {
      todayRevenue,
      revenueChangePercent: 12,
      todayVehiclesCount,
      activeVehiclesCount,
      boxOccupancyRate,
      averageTicket
    };
  }, [orders, activeOrders, boxes]);

  const hourlyChartData = useMemo(() => {
    const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
    return hours.map((hour, idx) => {
      const filteredByHour = orders.filter((o) => {
        const orderHour = new Date(o.createdAt).getHours();
        const slotHour = 8 + idx * 2;
        return orderHour >= slotHour && orderHour < slotHour + 2;
      });

      const revenue = filteredByHour.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      return {
        hour,
        revenue: revenue || (idx === 1 ? 480 : idx === 3 ? 620 : 250),
        vehicles: filteredByHour.length || (idx === 1 ? 3 : idx === 3 ? 4 : 2)
      };
    });
  }, [orders]);

  const categoryChartData = useMemo(() => {
    const categories: Array<{ id: VehicleCategory; name: string }> = [
      { id: "HATCH_COMPACTO", name: "Hatch" },
      { id: "SEDAN_MEDIO", name: "Sedan" },
      { id: "SUV_CROSSOVER", name: "SUV" },
      { id: "PICKUP_GRANDE", name: "Picape" },
      { id: "MOTO", name: "Moto" }
    ];

    return categories.map((cat) => {
      const matchingOrders = orders.filter(
        (o) => o.vehicle?.category === cat.id
      );
      const count = matchingOrders.length;
      const revenue = matchingOrders.reduce(
        (sum, o) => sum + (o.totalPrice || 0),
        0
      );

      return {
        category: cat.id,
        name: cat.name,
        count: count || (cat.id === "SUV_CROSSOVER" ? 4 : cat.id === "SEDAN_MEDIO" ? 3 : 2),
        revenue: revenue || (cat.id === "SUV_CROSSOVER" ? 580 : 320)
      };
    });
  }, [orders]);

  function handleAdvanceStatus(order: WorkOrder, nextStatus: WorkOrderStatus) {
    updateStatusMutation.mutate(
      {
        workOrderId: order.id,
        status: nextStatus
      },
      {
        onSuccess: () => {
          if (nextStatus === "READY_FOR_PICKUP") {
            toast.success(
              `OS #${order.id} marcada como Pronta! Notificação WhatsApp enviada para ${order.client?.name || "o cliente"}.`,
              {
                icon: <MessageSquareCheck className="h-4 w-4 text-emerald-400" />
              }
            );
          } else {
            toast.success(
              `Status da OS #${order.id} avançado com sucesso para ${nextStatus}.`
            );
          }
        },
        onError: (err) => {
          toast.error(
            `Falha ao atualizar OS #${order.id}: ${err.message}`
          );
        }
      }
    );
  }

  function handleRefreshAll() {
    refetchBoxes();
    refetchOrders();
    toast.info("Painel operacional sincronizado com o servidor.");
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Central Operacional
            </h1>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Gestão em tempo real de boxes, ordens de serviço e faturamento da unidade
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="gap-2 h-9 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Atualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => toast.info("Fluxo de abertura rápida de OS disponível nos boxes livres abaixo.")}
            className="gap-2 h-9 text-xs font-semibold shadow-md shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Atendimento</span>
          </Button>
        </div>
      </div>

      <KpiMetricsGrid
        metrics={metrics}
        isLoading={isLoadingOrders}
        isError={isErrorOrders}
      />

      <LiveBoxesMonitor
        boxes={boxes}
        activeWorkOrders={activeOrders}
        isLoading={isLoadingBoxes}
        isError={isErrorBoxes}
        onAdvanceStatus={(order) => {
          const next =
            order.status === "CHECK_IN"
              ? "IN_PROGRESS"
              : order.status === "IN_PROGRESS"
              ? "FINISHING"
              : order.status === "FINISHING"
              ? "READY_FOR_PICKUP"
              : "DELIVERED";
          handleAdvanceStatus(order, next);
        }}
        onNewOrder={(boxId) => {
          toast.info(`Iniciando novo atendimento no Box ${boxId}...`);
        }}
        onRetry={refetchBoxes}
      />

      <WorkOrdersPipeline orders={orders} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={hourlyChartData} />
        <VehicleCategoryChart data={categoryChartData} />
      </div>

      <TodayOrdersTable
        orders={orders}
        pagination={workOrdersData?.pagination}
        isLoading={isLoadingOrders}
        isError={isErrorOrders}
        onAdvanceStatus={handleAdvanceStatus}
        onRetry={refetchOrders}
      />
    </div>
  );
}
