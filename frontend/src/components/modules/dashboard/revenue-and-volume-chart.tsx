import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardChartPoint } from "@/services/queries/use-dashboard-data";

interface RevenueAndVolumeChartProps {
  data?: DashboardChartPoint[];
  isLoading: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#2E3B52] bg-[#1E293B] p-3 shadow-xl">
        <p className="text-xs font-semibold text-slate-300 pb-1.5 border-b border-[#2E3B52] mb-2">
          {label}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400 inline-block" />
              Faturamento:
            </span>
            <span className="font-bold text-white tabular-nums">
              R$ {Number(payload[0]?.value || 0).toFixed(2).replace(".", ",")}
            </span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                Veículos:
              </span>
              <span className="font-bold text-white tabular-nums">
                {payload[1]?.value}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueAndVolumeChart: React.FC<RevenueAndVolumeChartProps> = ({
  data = [],
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="border-[#1E2638] bg-[#121826]">
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3.5 w-64" />
        </CardHeader>
        <CardContent className="h-[280px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#1E2638] bg-[#121826]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold text-white">
            Evolução de Atendimentos & Faturamento
          </CardTitle>
          <CardDescription>
            Desempenho diário dos serviços concluídos
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-500 inline-block" />
            <span>Faturamento (R$)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400 inline-block" />
            <span>Veículos</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="vehiclesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2638" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Faturamento"
                stroke="#0EA5E9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
              <Area
                type="monotone"
                dataKey="vehicles"
                name="Veículos"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#vehiclesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
