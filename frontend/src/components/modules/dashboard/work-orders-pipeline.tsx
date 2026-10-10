import type { ComponentType } from "react";
import {
  Clock,
  Sparkles,
  Wrench,
  CheckCircle2,
  PackageCheck,
  XCircle,
  Kanban
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardFilterStore } from "@/stores/dashboard-filter.store";
import type { WorkOrder, WorkOrderStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

interface WorkOrdersPipelineProps {
  orders: WorkOrder[];
}

interface StepConfig {
  status: WorkOrderStatus;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  badgeBg: string;
}

const STEPS: StepConfig[] = [
  {
    status: "CHECK_IN",
    label: "Check-in",
    icon: Clock,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    badgeBg: "bg-amber-500/10"
  },
  {
    status: "IN_PROGRESS",
    label: "Em Lavagem",
    icon: Sparkles,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    badgeBg: "bg-blue-500/10"
  },
  {
    status: "FINISHING",
    label: "Acabamento",
    icon: Wrench,
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    badgeBg: "bg-purple-500/10"
  },
  {
    status: "READY_FOR_PICKUP",
    label: "Pronto Retirada",
    icon: CheckCircle2,
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    badgeBg: "bg-emerald-500/10"
  },
  {
    status: "DELIVERED",
    label: "Entregues Hoje",
    icon: PackageCheck,
    color: "text-slate-300",
    borderColor: "border-slate-500/40",
    badgeBg: "bg-slate-500/10"
  },
  {
    status: "CANCELLED",
    label: "Cancelados",
    icon: XCircle,
    color: "text-rose-400",
    borderColor: "border-rose-500/40",
    badgeBg: "bg-rose-500/10"
  }
];

export function WorkOrdersPipeline({ orders }: WorkOrdersPipelineProps) {
  const { statusFilter, setStatusFilter } = useDashboardFilterStore();

  const countByStatus = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="border border-border/80 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Kanban className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Esteira Operacional de Atendimentos
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          Clique no estágio para filtrar a tabela
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const count = countByStatus[step.status] || 0;
          const isSelected = statusFilter === step.status;

          return (
            <button
              key={step.status}
              type="button"
              onClick={() =>
                setStatusFilter(isSelected ? "ALL" : step.status)
              }
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all cursor-pointer",
                isSelected
                  ? `bg-secondary border-primary ring-1 ring-primary shadow-sm`
                  : `border-border/60 bg-secondary/30 hover:bg-secondary/60 hover:border-border`
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md mb-1.5 transition-transform group-hover:scale-110",
                  step.badgeBg,
                  step.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-mono text-lg font-bold text-foreground">
                {count}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground truncate max-w-full">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
