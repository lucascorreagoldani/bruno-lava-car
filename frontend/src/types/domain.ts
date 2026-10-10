export type VehicleCategory =
  | "HATCH_COMPACTO"
  | "SEDAN_MEDIO"
  | "SUV_CROSSOVER"
  | "PICKUP_GRANDE"
  | "MOTO";

export type WorkOrderStatus =
  | "CHECK_IN"
  | "IN_PROGRESS"
  | "FINISHING"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export type BoxStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface Box {
  id: number;
  name: string;
  status: BoxStatus;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  cpf?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  plate: string;
  model: string;
  brand: string;
  color: string;
  category: VehicleCategory;
  clientId: number;
  client?: Client;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  durationMinutes: number;
  active: boolean;
  basePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderItem {
  id: number;
  workOrderId: number;
  serviceId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service?: Service;
  createdAt: string;
}

export interface WorkOrder {
  id: number;
  clientId: number;
  vehiclePlate: string;
  boxId: number;
  appointmentId?: number | null;
  status: WorkOrderStatus;
  totalPrice: number;
  notes?: string | null;
  cancellationReason?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  vehicle?: Vehicle;
  box?: Box;
  items?: WorkOrderItem[];
}

export interface DashboardMetricSummary {
  todayRevenue: number;
  revenueChangePercent: number;
  todayVehiclesCount: number;
  activeVehiclesCount: number;
  boxOccupancyRate: number;
  averageTicket: number;
}
