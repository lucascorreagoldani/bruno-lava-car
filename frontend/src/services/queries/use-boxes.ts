import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import type { PaginatedResult } from "@/types/api";
import type { Box, BoxStatus } from "@/types/domain";

export function useBoxesQuery() {
  return useQuery<PaginatedResult<Box>>({
    queryKey: ["boxes"],
    queryFn: () => apiClient.get<PaginatedResult<Box>>("/boxes", { params: { limit: 50 } }),
    refetchInterval: 10000
  });
}

export function useUpdateBoxStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boxId, status }: { boxId: number; status: BoxStatus }) =>
      apiClient.patch<Box>(`/boxes/${boxId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    }
  });
}
