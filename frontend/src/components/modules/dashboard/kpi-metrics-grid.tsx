import { DollarSign, Car, Gauge, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyBRL } from "@/utils/currency";
import type { DashboardMetricSummary } from "@/types/domain";

interface KpiMetricsGridProps {
  metrics?: DashboardMetricSummary;
  isLoading: boolean;
  isError: boolean;
}

export function KpiMetricsGrid({ metrics, isLoading, isError }: KpiMetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !metrics) {
    return null;
  }

  const items = [
    {
      title: "Faturamento do Dia",
      value: formatCurrencyBRL(metrics.todayRevenue),
      change: `+${metrics.revenueChangePercent}% vs ontem`,
      icon: DollarSign,
      accentColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Veículos Atendidos",
      value: `${metrics.todayVehiclesCount} veículos`,
      change: `${metrics.activeVehiclesCount} em atendimento agora`,
      icon: Car,
      accentColor: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Taxa de Ocupação dos Boxes",
      value: `${metrics.boxOccupancyRate}%`,
      change: metrics.boxOccupancyRate > 70 ? "Capacidade alta" : "Operação estável",
      icon: Gauge,
      accentColor: "text-amber-400",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Ticket Médio",
      value: formatCurrencyBRL(metrics.averageTicket),
      change: "Por ordem de serviço",
      icon: TrendingUp,
      accentColor: "text-purple-400",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card
            key={idx}
            className="relative overflow-hidden border border-border/80 bg-card p-5 hover:border-border transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {item.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bgColor} ${item.accentColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {item.value}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span>{item.change}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
