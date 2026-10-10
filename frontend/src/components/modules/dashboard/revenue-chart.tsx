import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/utils/currency";

interface HourlyPoint {
  hour: string;
  revenue: number;
  vehicles: number;
}

interface RevenueChartProps {
  data: HourlyPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="border border-border/80 bg-card">
      <CardHeader className="p-5 pb-2 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Receita & Fluxo por Faixa Horária
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribuição de faturamento ao longo do expediente operacional
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rev = payload[0].value as number;
                    const veh = payload[0].payload.vehicles as number;
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-sm">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          Horário: {label}
                        </span>
                        <div className="mt-1.5 flex flex-col gap-1 text-xs">
                          <span className="font-mono font-bold text-primary">
                            {formatCurrencyBRL(rev)}
                          </span>
                          <span className="text-muted-foreground">
                            {veh} veículo(s) atendido(s)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
