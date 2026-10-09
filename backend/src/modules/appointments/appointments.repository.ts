import { eq, and, not, inArray, gte, lte, lt, gt, count, desc, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index.js";
import { appointments, Appointment } from "../../db/schema/appointments.js";
import { appointmentHistory, AppointmentHistoryRecord } from "../../db/schema/appointment-history.js";
import { AppointmentStatus, AppointmentHistoryAction } from "../../db/schema/enums/appointment-status.js";
import {
  AppointmentsRepositoryContract,
  CreateAppointmentPersistenceDTO,
  AppointmentFilterParams,
  AppointmentWithRelations,
  PaginatedAppointmentsOutput
} from "./appointments.contract.js";
import { formatPriceBRL } from "../services/services.service.js";

export class DrizzleAppointmentsRepository implements AppointmentsRepositoryContract {
  constructor(private readonly database: NodePgDatabase<typeof schema>) { }

  private formatAppointment(raw: any): AppointmentWithRelations {
    return {
      ...raw,
      formattedPrice: formatPriceBRL(raw.priceInCents),
      client: {
        id: raw.client.id,
        fullName: raw.client.fullName,
        phone: raw.client.phone
      },
      vehicle: {
        plate: raw.vehicle.plate,
        brand: raw.vehicle.brand,
        model: raw.vehicle.model,
        color: raw.vehicle.color,
        category: raw.vehicle.category
      },
      service: {
        id: raw.service.id,
        name: raw.service.name,
        durationMinutes: raw.service.durationMinutes
      },
      box: {
        id: raw.box.id,
        name: raw.box.name,
        status: raw.box.status
      }
    };
  }

  async create(data: CreateAppointmentPersistenceDTO): Promise<AppointmentWithRelations> {
    return this.database.transaction(async (tx) => {
      const [created] = await tx
        .insert(appointments)
        .values({
          clientId: data.clientId,
          vehiclePlate: data.vehiclePlate,
          serviceId: data.serviceId,
          boxId: data.boxId,
          scheduledAt: data.scheduledAt,
          estimatedEndAt: data.estimatedEndAt,
          priceInCents: data.priceInCents,
          status: "SCHEDULED",
          notes: data.notes
        })
        .returning();

      if (!created) {
        throw new Error("Falha ao criar registro de agendamento.");
      }

      await tx.insert(appointmentHistory).values({
        appointmentId: created.id,
        previousStatus: null,
        newStatus: "SCHEDULED",
        action: "CREATED",
        notes: "Agendamento inicial criado no sistema."
      });

      const fullAppointment = await tx.query.appointments.findFirst({
        where: eq(appointments.id, created.id),
        with: {
          client: true,
          vehicle: true,
          service: true,
          box: true
        }
      });

      if (!fullAppointment) {
        throw new Error("Falha ao recuperar agendamento recém-criado.");
      }

      return this.formatAppointment(fullAppointment);
    });
  }

  async findById(id: number): Promise<AppointmentWithRelations | null> {
    const found = await this.database.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        client: true,
        vehicle: true,
        service: true,
        box: true
      }
    });

    if (!found) {
      return null;
    }

    return this.formatAppointment(found);
  }

  async findOverlappingAppointment(
    boxId: number,
    startAt: Date,
    endAt: Date,
    excludeId?: number
  ): Promise<Appointment | null> {
    const conditions = [
      eq(appointments.boxId, boxId),
      inArray(appointments.status, ["SCHEDULED", "CONFIRMED"]),
      lt(appointments.scheduledAt, endAt),
      gt(appointments.estimatedEndAt, startAt)
    ];

    if (excludeId) {
      conditions.push(not(eq(appointments.id, excludeId)));
    }

    const [overlapping] = await this.database
      .select()
      .from(appointments)
      .where(and(...conditions))
      .limit(1);

    return overlapping || null;
  }

  async list(params: AppointmentFilterParams): Promise<PaginatedAppointmentsOutput> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.status) {
      conditions.push(eq(appointments.status, params.status));
    }

    if (params.boxId) {
      conditions.push(eq(appointments.boxId, params.boxId));
    }

    if (params.clientId) {
      conditions.push(eq(appointments.clientId, params.clientId));
    }

    if (params.vehiclePlate) {
      conditions.push(eq(appointments.vehiclePlate, params.vehiclePlate));
    }

    if (params.startDate) {
      conditions.push(gte(appointments.scheduledAt, params.startDate));
    }

    if (params.endDate) {
      conditions.push(lte(appointments.scheduledAt, params.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await this.database
      .select({ total: count() })
      .from(appointments)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const items = await this.database.query.appointments.findMany({
      where: whereClause,
      with: {
        client: true,
        vehicle: true,
        service: true,
        box: true
      },
      orderBy: desc(appointments.scheduledAt),
      limit,
      offset
    });

    return {
      items: items.map((item) => this.formatAppointment(item)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit)
    };
  }

  async updateStatus(
    id: number,
    status: AppointmentStatus,
    cancellationReason?: string,
    notes?: string
  ): Promise<AppointmentWithRelations | null> {
    return this.database.transaction(async (tx) => {
      const current = await tx.query.appointments.findFirst({
        where: eq(appointments.id, id)
      });

      if (!current) {
        return null;
      }

      let action: AppointmentHistoryAction = "STATUS_CHANGED";
      if (status === "CANCELLED") {
        action = "CANCELLED";
      } else if (status === "COMPLETED") {
        action = "COMPLETED";
      }

      const completedAt = status === "COMPLETED" ? new Date() : current.completedAt;

      await tx
        .update(appointments)
        .set({
          status,
          cancellationReason: status === "CANCELLED" ? cancellationReason : current.cancellationReason,
          completedAt,
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id));

      await tx.insert(appointmentHistory).values({
        appointmentId: id,
        previousStatus: current.status,
        newStatus: status,
        action,
        reason: cancellationReason,
        notes
      });

      const updated = await tx.query.appointments.findFirst({
        where: eq(appointments.id, id),
        with: {
          client: true,
          vehicle: true,
          service: true,
          box: true
        }
      });

      if (!updated) {
        return null;
      }

      return this.formatAppointment(updated);
    });
  }

  async reschedule(
    id: number,
    data: {
      scheduledAt: Date;
      estimatedEndAt: Date;
      boxId?: number;
      reason?: string;
      notes?: string;
    }
  ): Promise<AppointmentWithRelations | null> {
    return this.database.transaction(async (tx) => {
      const current = await tx.query.appointments.findFirst({
        where: eq(appointments.id, id)
      });

      if (!current) {
        return null;
      }

      const targetBoxId = data.boxId || current.boxId;

      await tx
        .update(appointments)
        .set({
          scheduledAt: data.scheduledAt,
          estimatedEndAt: data.estimatedEndAt,
          boxId: targetBoxId,
          updatedAt: new Date()
        })
        .where(eq(appointments.id, id));

      await tx.insert(appointmentHistory).values({
        appointmentId: id,
        previousStatus: current.status,
        newStatus: current.status,
        action: "RESCHEDULED",
        reason: data.reason,
        notes: data.notes,
        metadata: {
          previousBoxId: current.boxId,
          newBoxId: targetBoxId,
          previousScheduledAt: current.scheduledAt.toISOString(),
          newScheduledAt: data.scheduledAt.toISOString()
        }
      });

      const updated = await tx.query.appointments.findFirst({
        where: eq(appointments.id, id),
        with: {
          client: true,
          vehicle: true,
          service: true,
          box: true
        }
      });

      if (!updated) {
        return null;
      }

      return this.formatAppointment(updated);
    });
  }

  async getHistory(appointmentId: number): Promise<AppointmentHistoryRecord[]> {
    return this.database
      .select()
      .from(appointmentHistory)
      .where(eq(appointmentHistory.appointmentId, appointmentId))
      .orderBy(asc(appointmentHistory.createdAt));
  }

  async listByClient(
    clientId: number,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedAppointmentsOutput> {
    return this.list({
      clientId,
      page: params.page,
      limit: params.limit
    });
  }

  async listByVehicle(
    vehiclePlate: string,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedAppointmentsOutput> {
    return this.list({
      vehiclePlate,
      page: params.page,
      limit: params.limit
    });
  }
}
