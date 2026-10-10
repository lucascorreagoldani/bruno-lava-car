import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import type { PaginatedResult } from "@/types/api";
import type { WorkOrder, WorkOrderStatus } from "@/types/domain";

export interface WorkOrdersQueryParams {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  boxId?: number;
  clientId?: number;
  vehiclePlate?: string;
  startDate?: string;
  endDate?: string;
}

export function useWorkOrdersQuery(params: WorkOrdersQueryParams = {}) {
  return useQuery<PaginatedResult<WorkOrder>>({
    queryKey: ["work-orders", params],
    queryFn: () => apiClient.get<PaginatedResult<WorkOrder>>("/work-orders", { params }),
    retry: 1,
    refetchInterval: (query) => (query.state.status === "error" ? false : 10000)
  });
}

export function useUpdateWorkOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workOrderId,
      status,
      cancellationReason,
      notes
    }: {
      workOrderId: number;
      status: WorkOrderStatus;
      cancellationReason?: string;
      notes?: string;
    }) =>
      apiClient.patch<WorkOrder>(`/work-orders/${workOrderId}/status`, {
        status,
        cancellationReason,
        notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    }
  });
}
