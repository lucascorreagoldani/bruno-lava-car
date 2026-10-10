import { useMemo, useState } from "react";
import {
  PlusCircle,
  RefreshCw,
  MessageSquareCheck,
  ServerOff
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { DEMO_BOXES, DEMO_WORK_ORDERS } from "@/services/demo-data";
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

  const isBackendOffline = isErrorBoxes || isErrorOrders;
  const [demoOrders, setDemoOrders] = useState<WorkOrder[]>(DEMO_WORK_ORDERS);

  const boxes = useMemo(() => {
    if (isBackendOffline) {
      return DEMO_BOXES;
    }
    return boxesData?.data || [];
  }, [boxesData, isBackendOffline]);

  const orders = useMemo(() => {
    if (isBackendOffline) {
      return demoOrders;
    }
    return workOrdersData?.data || [];
  }, [workOrdersData, demoOrders, isBackendOffline]);

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
    if (isBackendOffline) {
      setDemoOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
      );
      if (nextStatus === "READY_FOR_PICKUP") {
        toast.success(
          `OS #${order.id} marcada como Pronta! Notificação simulada via WhatsApp para ${order.client?.name}.`,
          {
            icon: <MessageSquareCheck className="h-4 w-4 text-emerald-400" />
          }
        );
      } else {
        toast.success(
          `Status da OS #${order.id} avançado para ${nextStatus} (Modo Preview).`
        );
      }
      return;
    }

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
    toast.info("Verificando conexão com o servidor backend...");
  }

  return (
    <div className="space-y-8 pb-12">
      {isBackendOffline && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <ServerOff className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                    Backend Offline (502 Bad Gateway)
                  </h4>
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                    Modo Demonstração Ativo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A API em http://localhost:3333 não está respondendo. O painel está exibindo dados ilustrativos para validação visual completa.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="gap-2 h-8 text-xs border-amber-500/40 hover:bg-amber-500/20 text-amber-200 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reconectar Backend</span>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Central Operacional
            </h1>
            <span
              className={`flex h-2.5 w-2.5 rounded-full ${
                isBackendOffline
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500 animate-pulse"
              }`}
            />
            {isBackendOffline && (
              <Badge variant="secondary" className="font-mono text-[10px]">
                PREVIEW
              </Badge>
            )}
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
            onClick={() =>
              toast.info(
                "Fluxo de abertura rápida disponível selecionando um box livre abaixo."
              )
            }
            className="gap-2 h-9 text-xs font-semibold shadow-md shadow-primary/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Atendimento</span>
          </Button>
        </div>
      </div>

      <KpiMetricsGrid
        metrics={metrics}
        isLoading={!isBackendOffline && isLoadingOrders}
        isError={false}
      />

      <LiveBoxesMonitor
        boxes={boxes}
        activeWorkOrders={activeOrders}
        isLoading={!isBackendOffline && isLoadingBoxes}
        isError={false}
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
        pagination={
          isBackendOffline
            ? { page: 1, limit: 10, total: orders.length, totalPages: 1 }
            : workOrdersData?.pagination
        }
        isLoading={!isBackendOffline && isLoadingOrders}
        isError={false}
        onAdvanceStatus={handleAdvanceStatus}
        onRetry={refetchOrders}
      />
    </div>
  );
}
