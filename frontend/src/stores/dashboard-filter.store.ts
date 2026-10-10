import { create } from "zustand";
import type { WorkOrderStatus } from "@/types/domain";

export type DatePeriod = "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "MONTH";

interface DashboardFilterState {
  searchTerm: string;
  statusFilter: WorkOrderStatus | "ALL";
  datePeriod: DatePeriod;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: WorkOrderStatus | "ALL") => void;
  setDatePeriod: (period: DatePeriod) => void;
  resetFilters: () => void;
}

export const useDashboardFilterStore = create<DashboardFilterState>((set) => ({
  searchTerm: "",
  statusFilter: "ALL",
  datePeriod: "TODAY",
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setStatusFilter: (status: WorkOrderStatus | "ALL") => set({ statusFilter: status }),
  setDatePeriod: (period: DatePeriod) => set({ datePeriod: period }),
  resetFilters: () => set({ searchTerm: "", statusFilter: "ALL", datePeriod: "TODAY" })
}));
