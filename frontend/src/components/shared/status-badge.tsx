import React from "react";
import { CheckCircle2, Clock, Sparkles, AlertCircle, XCircle, Wrench } from "lucide-react";
import type { WorkOrderStatus, BoxStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: WorkOrderStatus | BoxStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "success" | "warning" | "info" | "purple" | "destructive" }
> = {
  CHECK_IN: {
    label: "Check-in",
    icon: Clock,
    variant: "warning"
  },
  IN_PROGRESS: {
    label: "Em Lavagem",
    icon: Sparkles,
    variant: "info"
  },
  FINISHING: {
    label: "Acabamento",
    icon: Wrench,
    variant: "purple"
  },
  READY_FOR_PICKUP: {
    label: "Pronto p/ Retirada",
    icon: CheckCircle2,
    variant: "success"
  },
  DELIVERED: {
    label: "Entregue",
    icon: CheckCircle2,
    variant: "default"
  },
  CANCELLED: {
    label: "Cancelado",
    icon: XCircle,
    variant: "destructive"
  },
  ACTIVE: {
    label: "Operacional",
    icon: CheckCircle2,
    variant: "success"
  },
  MAINTENANCE: {
    label: "Manutenção",
    icon: AlertCircle,
    variant: "warning"
  },
  INACTIVE: {
    label: "Inativo",
    icon: XCircle,
    variant: "secondary"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    icon: Clock,
    variant: "secondary"
  };

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5 font-medium shadow-none", className)}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
