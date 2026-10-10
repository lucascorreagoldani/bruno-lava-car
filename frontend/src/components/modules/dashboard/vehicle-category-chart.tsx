import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Car } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/utils/currency";

interface CategoryDataPoint {
  category: string;
  name: string;
  count: number;
  revenue: number;
}

interface VehicleCategoryChartProps {
  data: CategoryDataPoint[];
}

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#64748B"];

export function VehicleCategoryChart({ data }: VehicleCategoryChartProps) {
  return (
    <Card className="border border-border/80 bg-card">
      <CardHeader className="p-5 pb-2 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Car className="h-4 w-4 text-purple-400" />
            Demanda por Categoria de Veículo
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Volume e representatividade da frota atendida hoje
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
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
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategoryDataPoint;
                    return (
                      <div className="rounded-lg border border-border bg-popover/95 p-3 shadow-xl backdrop-blur-sm">
                        <span className="font-semibold text-xs text-foreground">
                          {item.name}
                        </span>
                        <div className="mt-1.5 flex flex-col gap-1 text-xs">
                          <span className="text-muted-foreground">
                            {item.count} veículo(s) atendido(s)
                          </span>
                          <span className="font-mono font-bold text-emerald-400">
                            Receita: {formatCurrencyBRL(item.revenue)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
