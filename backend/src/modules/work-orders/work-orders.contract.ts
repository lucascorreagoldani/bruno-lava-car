import { WorkOrder } from "../../db/schema/work-orders.js";
import { WorkOrderItem } from "../../db/schema/work-order-items.js";
import { WorkOrderHistoryRecord } from "../../db/schema/work-order-history.js";
import { WorkOrderStatus } from "../../db/schema/enums/work-order-status.js";

export interface CreateWorkOrderInputDTO {
  clientId: number;
  vehiclePlate: string;
  boxId: number;
  appointmentId?: number;
  serviceIds: number[];
  notes?: string;
}

export interface AddWorkOrderItemDTO {
  serviceId: number;
  quantity?: number;
}

export interface UpdateWorkOrderStatusDTO {
  status: WorkOrderStatus;
  cancellationReason?: string;
  notes?: string;
}

export interface WorkOrderFilterParams {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  boxId?: number;
  clientId?: number;
  vehiclePlate?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface FormattedWorkOrderItem extends WorkOrderItem {
  formattedUnitPrice: string;
  formattedTotalPrice: string;
}

export interface WorkOrderWithRelations extends WorkOrder {
  client: {
    id: number;
    fullName: string;
    phone: string;
  };
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    color: string;
    category: string;
  };
  box: {
    id: number;
    name: string;
    status: string;
  };
  appointment?: {
    id: number;
    scheduledAt: Date;
  } | null;
  items: FormattedWorkOrderItem[];
  formattedTotalPrice: string;
}

export interface PaginatedWorkOrdersOutput {
  items: WorkOrderWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateWorkOrderPersistenceItemDTO {
  serviceId: number;
  serviceName: string;
  unitPriceInCents: number;
  quantity: number;
  totalPriceInCents: number;
}

export interface CreateWorkOrderPersistenceDTO {
  orderNumber: string;
  appointmentId?: number;
  clientId: number;
  vehiclePlate: string;
  boxId: number;
  notes?: string;
  items: CreateWorkOrderPersistenceItemDTO[];
}

export interface WorkOrdersRepositoryContract {
  create(data: CreateWorkOrderPersistenceDTO): Promise<WorkOrderWithRelations>;
  findById(id: number): Promise<WorkOrderWithRelations | null>;
  findByOrderNumber(orderNumber: string): Promise<WorkOrderWithRelations | null>;
  findActiveByBoxId(boxId: number, excludeId?: number): Promise<WorkOrder | null>;
  getNextOrderSequence(): Promise<number>;
  list(params: WorkOrderFilterParams): Promise<PaginatedWorkOrdersOutput>;
  updateStatus(
    id: number,
    status: WorkOrderStatus,
    cancellationReason?: string,
    notes?: string
  ): Promise<WorkOrderWithRelations | null>;
  addItem(
    workOrderId: number,
    item: CreateWorkOrderPersistenceItemDTO
  ): Promise<WorkOrderWithRelations | null>;
  removeItem(workOrderId: number, itemId: number): Promise<WorkOrderWithRelations | null>;
  getHistory(workOrderId: number): Promise<WorkOrderHistoryRecord[]>;
  listByClient(
    clientId: number,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedWorkOrdersOutput>;
  listByVehicle(
    vehiclePlate: string,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedWorkOrdersOutput>;
}
