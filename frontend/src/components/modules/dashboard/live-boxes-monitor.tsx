import { Sparkles, Clock, CheckCircle2, Wrench, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LicensePlateBadge } from "@/components/shared/license-plate-badge";
import { VehicleCategoryBadge } from "@/components/shared/vehicle-category-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import type { Box, WorkOrder } from "@/types/domain";

interface LiveBoxesMonitorProps {
  boxes: Box[];
  activeWorkOrders: WorkOrder[];
  isLoading: boolean;
  isError: boolean;
  onAdvanceStatus?: (workOrder: WorkOrder) => void;
  onNewOrder?: (boxId: number) => void;
  onRetry?: () => void;
}

export function LiveBoxesMonitor({
  boxes,
  activeWorkOrders,
  isLoading,
  isError,
  onAdvanceStatus,
  onNewOrder,
  onRetry
}: LiveBoxesMonitorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-10 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-9 w-full mt-4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Falha ao sincronizar boxes operacionais"
        message="Não foi possível obter o estado em tempo real dos boxes físicos do lava-rápido."
        onRetry={onRetry}
      />
    );
  }

  if (boxes.length === 0) {
    return (
      <EmptyState
        title="Nenhum box cadastrado"
        description="Cadastre os boxes de lavagem para acompanhar a operação em tempo real."
        actionLabel="Cadastrar Box"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Wrench className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Boxes em Tempo Real
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Atualizado a cada 10s via Redis
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {boxes.map((box) => {
          const currentOrder = activeWorkOrders.find(
            (wo) =>
              wo.boxId === box.id &&
              wo.status !== "DELIVERED" &&
              wo.status !== "CANCELLED"
          );

          const isOccupied = Boolean(currentOrder);

          return (
            <Card
              key={box.id}
              className={`relative overflow-hidden border transition-all duration-200 ${
                isOccupied
                  ? "border-primary/40 bg-card shadow-sm shadow-primary/5"
                  : "border-border/70 bg-card/60"
              }`}
            >
              <CardHeader className="p-4 pb-2 flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {box.name}
                  </span>
                  {box.description && (
                    <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                      ({box.description})
                    </span>
                  )}
                </div>
                <StatusBadge status={box.status} />
              </CardHeader>

              <CardContent className="p-4 pt-2">
                {isOccupied && currentOrder ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <LicensePlateBadge
                        plate={currentOrder.vehiclePlate}
                        size="md"
                      />
                      {currentOrder.vehicle?.category && (
                        <VehicleCategoryBadge
                          category={currentOrder.vehicle.category}
                        />
                      )}
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-2.5 border border-border/40 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground truncate max-w-[140px]">
                          {currentOrder.vehicle?.brand} {currentOrder.vehicle?.model}
                        </span>
                        <StatusBadge status={currentOrder.status} />
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border/30">
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">
                          {currentOrder.items && currentOrder.items.length > 0
                            ? currentOrder.items.map((i) => i.service?.name || "Serviço").join(", ")
                            : "Lavagem e Estética"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Iniciado às {new Date(currentOrder.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-semibold">
                        #OS-{currentOrder.id}
                      </span>
                    </div>

                    {onAdvanceStatus && (
                      <Button
                        size="sm"
                        onClick={() => onAdvanceStatus(currentOrder)}
                        className="w-full gap-2 mt-2 h-8 text-xs font-medium"
                      >
                        <span>Avançar Etapa</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-emerald-400">
                      Box Disponível
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pronto para receber o próximo veículo
                    </p>
                    {onNewOrder && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNewOrder(box.id)}
                        className="mt-4 h-7 text-xs"
                      >
                        Iniciar Atendimento
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
