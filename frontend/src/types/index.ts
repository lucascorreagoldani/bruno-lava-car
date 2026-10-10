export type VehicleCategory = "HATCH" | "SEDAN" | "SUV" | "PICKUP";

export type BoxStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type WorkOrderStatus =
  | "CHECK_IN"
  | "IN_PROGRESS"
  | "FINISHING"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export type NotificationStatus = "QUEUED" | "PROCESSING" | "SENT" | "FAILED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface Client {
  id: number;
  fullName: string;
  phone: string;
  cpf?: string | null;
  email?: string | null;
  createdAt: string;
}

export interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  color: string;
  category: VehicleCategory;
  clientId: number;
  createdAt: string;
}

export interface Box {
  id: number;
  name: string;
  status: BoxStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePrice {
  id: number;
  serviceId: number;
  category: VehicleCategory;
  priceInCents: number;
  formattedPrice: string;
}

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  active: boolean;
  prices: ServicePrice[];
}

export interface WorkOrderItem {
  id: number;
  workOrderId: number;
  serviceId: number;
  serviceName: string;
  unitPriceInCents: number;
  quantity: number;
  totalPriceInCents: number;
  formattedUnitPrice: string;
  formattedTotalPrice: string;
}

export interface WorkOrder {
  id: number;
  orderNumber: string;
  appointmentId: number | null;
  clientId: number;
  vehiclePlate: string;
  boxId: number;
  status: WorkOrderStatus;
  totalPriceInCents: number;
  formattedTotalPrice: string;
  notes: string | null;
  cancellationReason: string | null;
  checkInAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  vehicle?: Vehicle;
  box?: Box;
  items?: WorkOrderItem[];
}

export interface Appointment {
  id: number;
  clientId: number;
  vehiclePlate: string;
  serviceId: number;
  boxId: number;
  scheduledAt: string;
  estimatedEndAt: string;
  priceInCents: number;
  formattedPrice: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  client?: Client;
  vehicle?: Vehicle;
  box?: Box;
}

export interface NotificationItem {
  id: number;
  type: string;
  channel: string;
  status: NotificationStatus;
  recipientPhone: string;
  recipientName: string;
  content: string;
  providerMessageId: string | null;
  attempts: number;
  sentAt: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  revenueTodayInCents: number;
  formattedRevenueToday: string;
  vehiclesServicedToday: number;
  activeBoxesCount: number;
  totalBoxesCount: number;
  occupancyRatePercentage: number;
  averageLeadTimeMinutes: number;
}
