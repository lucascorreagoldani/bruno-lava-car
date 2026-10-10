import React, { useState } from "react";
import {
  Clock,
  ArrowRight,
  Filter,
  Check,
  SendHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateWorkOrderStatus } from "@/services/queries/use-work-orders";
import type { WorkOrder, WorkOrderStatus, VehicleCategory } from "@/types";

interface RecentWorkOrdersTableProps {
  workOrders?: WorkOrder[];
  isLoading: boolean;
}

const STATUS_BADGES: Record<
  WorkOrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "purple" }
> = {
  CHECK_IN: { label: "Check-in", variant: "default" },
  IN_PROGRESS: { label: "Em Lavagem", variant: "warning" },
  FINISHING: { label: "Acabamento", variant: "purple" },
  READY_FOR_PICKUP: { label: "Pronto p/ Retirada", variant: "success" },
  DELIVERED: { label: "Entregue", variant: "secondary" },
  CANCELLED: { label: "Cancelado", variant: "destructive" }
};

const CATEGORY_BADGES: Record<VehicleCategory, { label: string; color: string }> = {
  HATCH: { label: "Hatch", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  SEDAN: { label: "Sedan", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  SUV: { label: "SUV", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  PICKUP: { label: "Picape", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
};

export const RecentWorkOrdersTable: React.FC<RecentWorkOrdersTableProps> = ({
  workOrders = [],
  isLoading
}) => {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "READY" | "DELIVERED">("ALL");
  const updateStatusMutation = useUpdateWorkOrderStatus();

  const filteredOrders = workOrders.filter((order) => {
    if (filter === "ACTIVE") {
      return (
        order.status === "CHECK_IN" ||
        order.status === "IN_PROGRESS" ||
        order.status === "FINISHING"
      );
    }
    if (filter === "READY") {
      return order.status === "READY_FOR_PICKUP";
    }
    if (filter === "DELIVERED") {
      return order.status === "DELIVERED";
    }
    return true;
  });

  const getNextAction = (order: WorkOrder) => {
    switch (order.status) {
      case "CHECK_IN":
        return {
          label: "Iniciar",
          nextStatus: "IN_PROGRESS" as WorkOrderStatus,
          icon: ArrowRight,
          color: "bg-sky-500 hover:bg-sky-600"
        };
      case "IN_PROGRESS":
        return {
          label: "Acabamento",
          nextStatus: "FINISHING" as WorkOrderStatus,
          icon: ArrowRight,
          color: "bg-purple-600 hover:bg-purple-700"
        };
      case "FINISHING":
        return {
          label: "Marcar Pronto",
          nextStatus: "READY_FOR_PICKUP" as WorkOrderStatus,
          icon: SendHorizontal,
          color: "bg-emerald-600 hover:bg-emerald-700"
        };
      case "READY_FOR_PICKUP":
        return {
          label: "Entregar",
          nextStatus: "DELIVERED" as WorkOrderStatus,
          icon: Check,
          color: "bg-blue-600 hover:bg-blue-700"
        };
      default:
        return null;
    }
  };

  return (
    <Card className="border-[#1E2638] bg-[#121826]">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#1E2638]">
        <div>
          <CardTitle className="text-base font-bold text-white">
            Ordens de Serviço Recentes
          </CardTitle>
          <CardDescription>
            Controle de veículos no pátio e avanço de etapas operacionais
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-[#0C111C] p-1 rounded-lg border border-[#1E2638]">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filter === "ALL"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Todos ({workOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ACTIVE")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filter === "ACTIVE"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            No Pátio
          </button>
          <button
            type="button"
            onClick={() => setFilter("READY")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filter === "READY"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Prontos
          </button>
          <button
            type="button"
            onClick={() => setFilter("DELIVERED")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              filter === "DELIVERED"
                ? "bg-[#1E293B] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Entregues
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0C111C]/60 text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-b border-[#1E2638]">
              <tr>
                <th className="py-3.5 px-5">Ordem</th>
                <th className="py-3.5 px-4">Veículo & Categoria</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Box</th>
                <th className="py-3.5 px-4">Serviços</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1E2638]/70">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-slate-900/30">
                    <td className="py-4 px-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="py-4 px-5 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="h-7 w-7 text-slate-400" />
                      <p className="text-sm font-medium text-slate-300">
                        Nenhuma Ordem de Serviço encontrada com este filtro.
                      </p>
                      <span className="text-xs text-slate-400">
                        Selecione outro status ou cadastre um novo atendimento.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_BADGES[order.status];
                  const categoryInfo =
                    CATEGORY_BADGES[order.vehicle?.category || "SEDAN"];
                  const action = getNextAction(order);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#182235]/40 transition-colors duration-100"
                    >
                      <td className="py-4 px-5 font-mono text-xs font-bold text-white">
                        {order.orderNumber}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            {order.vehiclePlate}
                          </span>
                          <span className="text-xs font-medium text-slate-200">
                            {order.vehicle?.brand} {order.vehicle?.model}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${categoryInfo.color}`}
                          >
                            {categoryInfo.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-slate-200">
                          {order.client?.fullName || "Cliente"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.client?.phone}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-medium text-slate-300">
                        {order.box?.name || `Box ${order.boxId}`}
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-300 max-w-[200px] truncate">
                        {order.items && order.items.length > 0
                          ? order.items.map((it) => it.serviceName).join(", ")
                          : "Lavagem"}
                      </td>

                      <td className="py-4 px-4 font-bold text-emerald-400 tabular-nums text-xs">
                        {order.formattedTotalPrice}
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={statusInfo.variant} className="text-[11px]">
                          {order.status === "IN_PROGRESS" && (
                            <Clock className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          {statusInfo.label}
                        </Badge>
                      </td>

                      <td className="py-4 px-5 text-right">
                        {action ? (
                          <Button
                            size="sm"
                            disabled={updateStatusMutation.isPending}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: order.id,
                                status: action.nextStatus
                              })
                            }
                            className={`h-8 px-2.5 text-xs text-white font-semibold rounded-lg shadow-sm ${action.color}`}
                          >
                            <span>{action.label}</span>
                            <action.icon className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            Finalizado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
