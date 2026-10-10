import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type {
  ApiResponse,
  Box,
  WorkOrder,
  Appointment,
  VehicleCategory
} from "@/types";

export interface DashboardCategoryStat {
  category: VehicleCategory;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardChartPoint {
  day: string;
  revenue: number;
  vehicles: number;
}

export interface DashboardAggregatedData {
  metrics: {
    revenueTotalInCents: number;
    formattedRevenueTotal: string;
    vehiclesTotal: number;
    activeBoxesCount: number;
    totalBoxesCount: number;
    occupancyRatePercentage: number;
    averageLeadTimeMinutes: number;
  };
  chartData: DashboardChartPoint[];
  categoryDistribution: DashboardCategoryStat[];
  recentWorkOrders: WorkOrder[];
  boxes: Box[];
  appointments: Appointment[];
}

const CATEGORY_COLORS: Record<VehicleCategory, string> = {
  HATCH: "#38BDF8",
  SEDAN: "#3B82F6",
  SUV: "#10B981",
  PICKUP: "#F59E0B"
};

const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  HATCH: "Hatch Compacto",
  SEDAN: "Sedan Médio",
  SUV: "SUV / Crossover",
  PICKUP: "Picape / Grande"
};

export function useDashboardData() {
  return useQuery<DashboardAggregatedData>({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const [workOrdersRes, boxesRes, appointmentsRes] = await Promise.all([
        api.get<ApiResponse<WorkOrder[]>>("/v1/work-orders?limit=50"),
        api.get<ApiResponse<Box[]>>("/v1/boxes"),
        api.get<ApiResponse<Appointment[]>>("/v1/appointments?limit=20")
      ]);

      const workOrders = workOrdersRes.data || [];
      const boxes = boxesRes.data || [];
      const appointments = appointmentsRes.data || [];

      const activeBoxes = boxes.filter((b) => b.status === "ACTIVE");
      const occupiedBoxesCount = workOrders.filter(
        (wo) => wo.status === "CHECK_IN" || wo.status === "IN_PROGRESS" || wo.status === "FINISHING"
      ).length;

      const totalBoxesCount = boxes.length;
      const activeBoxesCount = activeBoxes.length;
      const occupancyRate =
        activeBoxesCount > 0
          ? Math.min(Math.round((occupiedBoxesCount / activeBoxesCount) * 100), 100)
          : 0;

      const nonCancelledOrders = workOrders.filter((wo) => wo.status !== "CANCELLED");
      const totalRevenueInCents = nonCancelledOrders.reduce(
        (acc, wo) => acc + wo.totalPriceInCents,
        0
      );

      const completedOrders = workOrders.filter(
        (wo) => wo.checkInAt && wo.finishedAt && (wo.status === "READY_FOR_PICKUP" || wo.status === "DELIVERED")
      );

      let totalLeadTimeMinutes = 0;
      for (const order of completedOrders) {
        if (order.checkInAt && order.finishedAt) {
          const checkIn = new Date(order.checkInAt).getTime();
          const finished = new Date(order.finishedAt).getTime();
          const diffMinutes = Math.max(Math.round((finished - checkIn) / 60000), 15);
          totalLeadTimeMinutes += diffMinutes;
        }
      }

      const averageLeadTimeMinutes =
        completedOrders.length > 0
          ? Math.round(totalLeadTimeMinutes / completedOrders.length)
          : 45;

      const categoryCounts: Record<VehicleCategory, number> = {
        HATCH: 0,
        SEDAN: 0,
        SUV: 0,
        PICKUP: 0
      };

      for (const order of workOrders) {
        const cat = order.vehicle?.category || "SEDAN";
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat] += 1;
        } else {
          categoryCounts.SEDAN += 1;
        }
      }

      const totalCategorized = Math.max(workOrders.length, 1);
      const categoryDistribution: DashboardCategoryStat[] = (
        ["SEDAN", "SUV", "HATCH", "PICKUP"] as VehicleCategory[]
      ).map((cat) => ({
        category: cat,
        name: CATEGORY_LABELS[cat],
        count: categoryCounts[cat],
        percentage: Math.round((categoryCounts[cat] / totalCategorized) * 100),
        color: CATEGORY_COLORS[cat]
      }));

      const daysMap: Record<string, { revenue: number; vehicles: number }> = {};
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayKey = d.toLocaleDateString("pt-BR", { weekday: "short" });
        daysMap[dayKey] = { revenue: 0, vehicles: 0 };
      }

      for (const order of nonCancelledOrders) {
        const orderDate = new Date(order.createdAt);
        const dayKey = orderDate.toLocaleDateString("pt-BR", { weekday: "short" });
        if (daysMap[dayKey]) {
          daysMap[dayKey].revenue += order.totalPriceInCents / 100;
          daysMap[dayKey].vehicles += 1;
        }
      }

      const chartData: DashboardChartPoint[] = Object.entries(daysMap).map(([day, val]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1).replace(".", ""),
        revenue: val.revenue,
        vehicles: val.vehicles
      }));

      return {
        metrics: {
          revenueTotalInCents: totalRevenueInCents,
          formattedRevenueTotal: formatCurrency(totalRevenueInCents),
          vehiclesTotal: workOrders.length,
          activeBoxesCount,
          totalBoxesCount,
          occupancyRatePercentage: occupancyRate,
          averageLeadTimeMinutes
        },
        chartData,
        categoryDistribution,
        recentWorkOrders: workOrders,
        boxes,
        appointments
      };
    },
    refetchInterval: 15000
  });
}
