import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, WorkOrder, WorkOrderStatus } from "@/types";

export interface UpdateStatusPayload {
  id: number;
  status: WorkOrderStatus;
  notes?: string;
  cancellationReason?: string;
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes, cancellationReason }: UpdateStatusPayload) => {
      const res = await api.patch<ApiResponse<WorkOrder>>(`/v1/work-orders/${id}/status`, {
        status,
        notes,
        cancellationReason
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      toast.success(`Ordem ${data.orderNumber} atualizada para ${data.status}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status da Ordem de Serviço");
    }
  });
}
