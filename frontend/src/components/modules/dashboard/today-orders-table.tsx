import {
  ArrowRight,
  ClipboardList,
  Filter
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LicensePlateBadge } from "@/components/shared/license-plate-badge";
import { VehicleCategoryBadge } from "@/components/shared/vehicle-category-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrencyBRL } from "@/utils/currency";
import { useDashboardFilterStore } from "@/stores/dashboard-filter.store";
import type { WorkOrder, WorkOrderStatus } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

interface TodayOrdersTableProps {
  orders: WorkOrder[];
  pagination?: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
  onPageChange?: (page: number) => void;
  onAdvanceStatus?: (order: WorkOrder, nextStatus: WorkOrderStatus) => void;
  onRetry?: () => void;
}

const NEXT_STATUS_MAP: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
  CHECK_IN: "IN_PROGRESS",
  IN_PROGRESS: "FINISHING",
  FINISHING: "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "DELIVERED"
};

const NEXT_STATUS_LABEL: Partial<Record<WorkOrderStatus, string>> = {
  CHECK_IN: "Iniciar Lavagem",
  IN_PROGRESS: "Enviar p/ Acabamento",
  FINISHING: "Marcar Pronto (Notificar)",
  READY_FOR_PICKUP: "Entregar Veículo"
};

export function TodayOrdersTable({
  orders,
  pagination,
  isLoading,
  isError,
  onPageChange,
  onAdvanceStatus,
  onRetry
}: TodayOrdersTableProps) {
  const { statusFilter, setStatusFilter, searchTerm, setSearchTerm } = useDashboardFilterStore();

  if (isLoading) {
    return (
      <Card className="border border-border/80 bg-card p-5">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Falha ao carregar ordens de serviço"
        message="Não foi possível obter a listagem de atendimentos da API do lava-rápido."
        onRetry={onRetry}
      />
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL" && order.status !== statusFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPlate = order.vehiclePlate.toLowerCase().includes(term);
      const matchClient = order.client?.name.toLowerCase().includes(term);
      const matchId = String(order.id).includes(term);
      return matchPlate || matchClient || matchId;
    }
    return true;
  });

  return (
    <Card className="border border-border/80 bg-card">
      <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Ordens de Serviço em Operação
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gerenciamento físico dos atendimentos, transições de status e notificações
          </p>
        </div>

        <div className="flex items-center gap-2">
          {statusFilter !== "ALL" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("ALL")}
              className="h-8 text-xs gap-1 border-primary/50 text-primary"
            >
              <Filter className="h-3 w-3" />
              <span>Limpar Filtro ({statusFilter})</span>
            </Button>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {filteredOrders.length} atendimentos listados
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="Nenhuma ordem de serviço encontrada"
            description="Não há atendimentos para os critérios de busca selecionados."
            actionLabel={searchTerm || statusFilter !== "ALL" ? "Limpar Filtros" : undefined}
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
            className="border-0 rounded-none bg-transparent"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">OS #</TableHead>
                <TableHead>Veículo & Placa</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Box</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const nextStatus = NEXT_STATUS_MAP[order.status];
                const nextLabel = NEXT_STATUS_LABEL[order.status];

                return (
                  <TableRow key={order.id} className="hover:bg-card-hover/60">
                    <TableCell className="font-mono font-bold text-primary">
                      #{order.id}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <LicensePlateBadge plate={order.vehiclePlate} size="sm" />
                        <span className="text-xs font-medium text-foreground">
                          {order.vehicle?.brand} {order.vehicle?.model}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {order.vehicle?.category ? (
                        <VehicleCategoryBadge category={order.vehicle.category} />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">
                          {order.client?.name || "Cliente Balcão"}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {order.client?.phone || ""}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {order.items && order.items.length > 0
                          ? order.items.map((i) => i.service?.name || "Serviço").join(", ")
                          : "Lavagem Simples"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-foreground">
                        {order.box?.name || `Box ${order.boxId}`}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-mono font-semibold text-emerald-400">
                      {formatCurrencyBRL(order.totalPrice)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      {nextStatus && nextLabel && onAdvanceStatus ? (
                        <Button
                          size="sm"
                          variant={order.status === "FINISHING" ? "emerald" : "default"}
                          onClick={() => onAdvanceStatus(order, nextStatus)}
                          className="h-7 text-xs px-2.5 gap-1.5 font-medium whitespace-nowrap"
                        >
                          <span>{nextLabel}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Concluído
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {pagination && pagination.totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between border-t border-border/60 p-4">
            <span className="text-xs text-muted-foreground font-mono">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="h-8 text-xs"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                className="h-8 text-xs"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
