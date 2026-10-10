import React from "react";
import { CheckCircle2, Clock, Car, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Box, WorkOrder } from "@/types";

interface LiveBoxesStatusGridProps {
  boxes?: Box[];
  workOrders?: WorkOrder[];
  isLoading: boolean;
}

export const LiveBoxesStatusGrid: React.FC<LiveBoxesStatusGridProps> = ({
  boxes = [],
  workOrders = [],
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-[#1E2638] bg-[#121826]">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeOrdersByBox = new Map<number, WorkOrder>();
  for (const order of workOrders) {
    if (
      order.status === "CHECK_IN" ||
      order.status === "IN_PROGRESS" ||
      order.status === "FINISHING"
    ) {
      if (!activeOrdersByBox.has(order.boxId)) {
        activeOrdersByBox.set(order.boxId, order);
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Status dos Boxes Operacionais
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          Monitoramento em tempo real das baias
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boxes.map((box) => {
          const currentOrder = activeOrdersByBox.get(box.id);
          const isOccupied = !!currentOrder;

          return (
            <Card
              key={box.id}
              className={`border transition-all duration-150 ${
                isOccupied
                  ? "border-amber-500/30 bg-[#121826] shadow-sm shadow-amber-500/5"
                  : "border-[#1E2638] bg-[#121826]/70 hover:border-[#2E3B52]"
              }`}
            >
              <CardContent className="p-4.5">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="font-bold text-sm text-white">{box.name}</span>
                  </div>

                  {isOccupied ? (
                    <Badge variant="warning" className="text-[11px] font-semibold">
                      <Clock className="h-3 w-3 mr-1" />
                      Em Atendimento
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[11px] font-semibold">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Disponível
                    </Badge>
                  )}
                </div>

                <div className="pt-3">
                  {isOccupied && currentOrder ? (
                    <div className="rounded-lg bg-[#182235] p-3 border border-[#2E3B52]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {currentOrder.vehiclePlate}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300">
                          {currentOrder.orderNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                        <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {currentOrder.vehicle?.brand} {currentOrder.vehicle?.model}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#2E3B52]/40">
                        <span className="truncate">
                          {currentOrder.items?.[0]?.serviceName || "Lavagem"}
                        </span>
                        <span className="font-bold text-emerald-400 tabular-nums">
                          {currentOrder.formattedTotalPrice}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center rounded-lg border border-dashed border-[#1E2638] bg-[#0E1420]/50">
                      <p className="text-xs text-slate-400">Baia livre para novo atendimento</p>
                      <span className="text-[11px] text-slate-400 mt-0.5">Pronta para receber veículo</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
