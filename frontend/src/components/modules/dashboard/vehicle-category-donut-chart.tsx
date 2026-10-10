import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardCategoryStat } from "@/services/queries/use-dashboard-data";

interface VehicleCategoryDonutChartProps {
  data?: DashboardCategoryStat[];
  isLoading: boolean;
}

export const VehicleCategoryDonutChart: React.FC<VehicleCategoryDonutChartProps> = ({
  data = [],
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="border-[#1E2638] bg-[#121826]">
        <CardHeader>
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-3.5 w-52" />
        </CardHeader>
        <CardContent className="h-[280px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="border-[#1E2638] bg-[#121826]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-white">
          Categorias de Veículos
        </CardTitle>
        <CardDescription>
          Distribuição da frota atendida no pátio
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="relative h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DashboardCategoryStat;
                    return (
                      <div className="rounded-lg border border-[#2E3B52] bg-[#1E293B] p-2.5 shadow-xl text-xs">
                        <span className="font-semibold text-white">{item.name}</span>
                        <div className="text-slate-300 mt-1">
                          {item.count} veículos ({item.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#121826" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white tabular-nums">
              {totalCount}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Veículos
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2638]">
          {data.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-xs p-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-300 truncate text-[11px] font-medium">
                  {cat.name}
                </span>
              </div>
              <span className="font-semibold text-slate-100 tabular-nums text-[11px]">
                {cat.count} ({cat.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
