import React from "react";
import { DollarSign, Car, Layers, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardAggregatedData } from "@/services/queries/use-dashboard-data";

interface MetricsOverviewCardsProps {
  metrics?: DashboardAggregatedData["metrics"];
  isLoading: boolean;
}

export const MetricsOverviewCards: React.FC<MetricsOverviewCardsProps> = ({
  metrics,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-[#1E2638] bg-[#121826]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-36 mb-2" />
              <Skeleton className="h-3 w-44" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Faturamento Total",
      value: metrics?.formattedRevenueTotal || "R$ 0,00",
      description: "Atendimentos ativos e concluídos",
      icon: DollarSign,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      trendBadge: "+100%",
      trendColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Veículos Registrados",
      value: String(metrics?.vehiclesTotal || 0),
      description: "Ordens abertas no sistema",
      icon: Car,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/10 border-sky-500/20",
      trendBadge: "Ativos",
      trendColor: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      title: "Ocupação dos Boxes",
      value: `${metrics?.occupancyRatePercentage || 0}%`,
      description: `${metrics?.activeBoxesCount || 0} de ${metrics?.totalBoxesCount || 0} baias operacionais`,
      icon: Layers,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      trendBadge: metrics?.occupancyRatePercentage && metrics.occupancyRatePercentage > 50 ? "Alta" : "Normal",
      trendColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "Tempo Médio (Lead Time)",
      value: `${metrics?.averageLeadTimeMinutes || 45} min`,
      description: "Do check-in até pronto p/ retirada",
      icon: Clock,
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/10 border-indigo-500/20",
      trendBadge: "Ideal",
      trendColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;

        return (
          <Card
            key={idx}
            className="border-[#1E2638] bg-[#121826] hover:border-[#2E3B52] transition-colors duration-150"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {kpi.title}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${kpi.iconBg}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${kpi.iconColor}`} />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  {kpi.value}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold border ${kpi.trendColor}`}
                >
                  <TrendingUp className="h-2.5 w-2.5" />
                  {kpi.trendBadge}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400 font-medium">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
