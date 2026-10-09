import { Appointment } from "../../db/schema/appointments.js";
import { AppointmentHistoryRecord } from "../../db/schema/appointment-history.js";
import { AppointmentStatus } from "../../db/schema/enums/appointment-status.js";

export interface CreateAppointmentInputDTO {
  clientId: number;
  vehiclePlate: string;
  serviceId: number;
  boxId: number;
  scheduledAt: Date;
  notes?: string;
}

export interface UpdateAppointmentStatusDTO {
  status: AppointmentStatus;
  cancellationReason?: string;
  notes?: string;
}

export interface RescheduleAppointmentDTO {
  scheduledAt: Date;
  boxId?: number;
  reason?: string;
  notes?: string;
}

export interface AppointmentFilterParams {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  boxId?: number;
  clientId?: number;
  vehiclePlate?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AppointmentClientRelation {
  id: number;
  fullName: string;
  phone: string;
}

export interface AppointmentVehicleRelation {
  plate: string;
  brand: string;
  model: string;
  color: string;
  category: string;
}

export interface AppointmentServiceRelation {
  id: number;
  name: string;
  durationMinutes: number;
}

export interface AppointmentBoxRelation {
  id: number;
  name: string;
  status: string;
}

export interface AppointmentWithRelations extends Appointment {
  client: AppointmentClientRelation;
  vehicle: AppointmentVehicleRelation;
  service: AppointmentServiceRelation;
  box: AppointmentBoxRelation;
  formattedPrice: string;
}

export interface PaginatedAppointmentsOutput {
  items: AppointmentWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAppointmentPersistenceDTO {
  clientId: number;
  vehiclePlate: string;
  serviceId: number;
  boxId: number;
  scheduledAt: Date;
  estimatedEndAt: Date;
  priceInCents: number;
  notes?: string;
}

export interface AppointmentsRepositoryContract {
  create(data: CreateAppointmentPersistenceDTO): Promise<AppointmentWithRelations>;
  findById(id: number): Promise<AppointmentWithRelations | null>;
  findOverlappingAppointment(
    boxId: number,
    startAt: Date,
    endAt: Date,
    excludeId?: number
  ): Promise<Appointment | null>;
  list(params: AppointmentFilterParams): Promise<PaginatedAppointmentsOutput>;
  updateStatus(
    id: number,
    status: AppointmentStatus,
    cancellationReason?: string,
    notes?: string
  ): Promise<AppointmentWithRelations | null>;
  reschedule(
    id: number,
    data: {
      scheduledAt: Date;
      estimatedEndAt: Date;
      boxId?: number;
      reason?: string;
      notes?: string;
    }
  ): Promise<AppointmentWithRelations | null>;
  getHistory(appointmentId: number): Promise<AppointmentHistoryRecord[]>;
  listByClient(
    clientId: number,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedAppointmentsOutput>;
  listByVehicle(
    vehiclePlate: string,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedAppointmentsOutput>;
}
