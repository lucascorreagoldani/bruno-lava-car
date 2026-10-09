import { eq, and, not, inArray, gte, lte, count, desc, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index.js";
import { workOrders, WorkOrder } from "../../db/schema/work-orders.js";
import { workOrderItems } from "../../db/schema/work-order-items.js";
import { workOrderHistory, WorkOrderHistoryRecord } from "../../db/schema/work-order-history.js";
import { WorkOrderStatus, WorkOrderHistoryAction } from "../../db/schema/enums/work-order-status.js";
import {
  WorkOrdersRepositoryContract,
  CreateWorkOrderPersistenceDTO,
  CreateWorkOrderPersistenceItemDTO,
  WorkOrderFilterParams,
  WorkOrderWithRelations,
  PaginatedWorkOrdersOutput
} from "./work-orders.contract.js";
import { formatPriceBRL } from "../services/services.service.js";

export class DrizzleWorkOrdersRepository implements WorkOrdersRepositoryContract {
  constructor(private readonly database: NodePgDatabase<typeof schema>) { }

  private formatWorkOrder(raw: any): WorkOrderWithRelations {
    const formattedItems = (raw.items || []).map((item: any) => ({
      ...item,
      formattedUnitPrice: formatPriceBRL(item.unitPriceInCents),
      formattedTotalPrice: formatPriceBRL(item.totalPriceInCents)
    }));

    return {
      ...raw,
      formattedTotalPrice: formatPriceBRL(raw.totalPriceInCents),
      items: formattedItems,
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
      box: {
        id: raw.box.id,
        name: raw.box.name,
        status: raw.box.status
      },
      appointment: raw.appointment
        ? {
          id: raw.appointment.id,
          scheduledAt: raw.appointment.scheduledAt
        }
        : null
    };
  }

  async getNextOrderSequence(): Promise<number> {
    const [result] = await this.database.select({ total: count() }).from(workOrders);
    return Number(result?.total || 0) + 1;
  }

  async create(data: CreateWorkOrderPersistenceDTO): Promise<WorkOrderWithRelations> {
    return this.database.transaction(async (tx) => {
      const calculatedTotal = data.items.reduce(
        (sum, item) => sum + item.totalPriceInCents,
        0
      );

      const [created] = await tx
        .insert(workOrders)
        .values({
          orderNumber: data.orderNumber,
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          vehiclePlate: data.vehiclePlate,
          boxId: data.boxId,
          status: "CHECK_IN",
          totalPriceInCents: calculatedTotal,
          notes: data.notes
        })
        .returning();

      if (!created) {
        throw new Error("Falha ao registrar Ordem de Serviço.");
      }

      if (data.items.length > 0) {
        const itemRows = data.items.map((item) => ({
          workOrderId: created.id,
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          unitPriceInCents: item.unitPriceInCents,
          quantity: item.quantity,
          totalPriceInCents: item.totalPriceInCents
        }));

        await tx.insert(workOrderItems).values(itemRows);
      }

      await tx.insert(workOrderHistory).values({
        workOrderId: created.id,
        previousStatus: null,
        newStatus: "CHECK_IN",
        action: "CREATED",
        notes: "Ordem de Serviço criada e veículo registrado no pátio."
      });

      const fullRecord = await tx.query.workOrders.findFirst({
        where: eq(workOrders.id, created.id),
        with: {
          client: true,
          vehicle: true,
          box: true,
          appointment: true,
          items: true
        }
      });

      if (!fullRecord) {
        throw new Error("Falha ao recuperar Ordem de Serviço recém-criada.");
      }

      return this.formatWorkOrder(fullRecord);
    });
  }

  async findById(id: number): Promise<WorkOrderWithRelations | null> {
    const found = await this.database.query.workOrders.findFirst({
      where: eq(workOrders.id, id),
      with: {
        client: true,
        vehicle: true,
        box: true,
        appointment: true,
        items: true
      }
    });

    if (!found) {
      return null;
    }

    return this.formatWorkOrder(found);
  }

  async findByOrderNumber(orderNumber: string): Promise<WorkOrderWithRelations | null> {
    const found = await this.database.query.workOrders.findFirst({
      where: eq(workOrders.orderNumber, orderNumber),
      with: {
        client: true,
        vehicle: true,
        box: true,
        appointment: true,
        items: true
      }
    });

    if (!found) {
      return null;
    }

    return this.formatWorkOrder(found);
  }

  async findActiveByBoxId(boxId: number, excludeId?: number): Promise<WorkOrder | null> {
    const conditions = [
      eq(workOrders.boxId, boxId),
      inArray(workOrders.status, ["IN_PROGRESS", "FINISHING"])
    ];

    if (excludeId) {
      conditions.push(not(eq(workOrders.id, excludeId)));
    }

    const [active] = await this.database
      .select()
      .from(workOrders)
      .where(and(...conditions))
      .limit(1);

    return active || null;
  }

  async list(params: WorkOrderFilterParams): Promise<PaginatedWorkOrdersOutput> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.status) {
      conditions.push(eq(workOrders.status, params.status));
    }

    if (params.boxId) {
      conditions.push(eq(workOrders.boxId, params.boxId));
    }

    if (params.clientId) {
      conditions.push(eq(workOrders.clientId, params.clientId));
    }

    if (params.vehiclePlate) {
      conditions.push(eq(workOrders.vehiclePlate, params.vehiclePlate));
    }

    if (params.startDate) {
      conditions.push(gte(workOrders.checkInAt, params.startDate));
    }

    if (params.endDate) {
      conditions.push(lte(workOrders.checkInAt, params.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await this.database
      .select({ total: count() })
      .from(workOrders)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const items = await this.database.query.workOrders.findMany({
      where: whereClause,
      with: {
        client: true,
        vehicle: true,
        box: true,
        appointment: true,
        items: true
      },
      orderBy: desc(workOrders.checkInAt),
      limit,
      offset
    });

    return {
      items: items.map((item) => this.formatWorkOrder(item)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit)
    };
  }

  async updateStatus(
    id: number,
    status: WorkOrderStatus,
    cancellationReason?: string,
    notes?: string
  ): Promise<WorkOrderWithRelations | null> {
    return this.database.transaction(async (tx) => {
      const current = await tx.query.workOrders.findFirst({
        where: eq(workOrders.id, id)
      });

      if (!current) {
        return null;
      }

      let action: WorkOrderHistoryAction = "STATUS_CHANGED";
      if (status === "CANCELLED") {
        action = "CANCELLED";
      } else if (status === "DELIVERED") {
        action = "DELIVERED";
      }

      const startedAt =
        status === "IN_PROGRESS" && !current.startedAt ? new Date() : current.startedAt;
      const finishedAt =
        status === "READY_FOR_PICKUP" && !current.finishedAt ? new Date() : current.finishedAt;
      const deliveredAt =
        status === "DELIVERED" ? new Date() : current.deliveredAt;

      await tx
        .update(workOrders)
        .set({
          status,
          startedAt,
          finishedAt,
          deliveredAt,
          cancellationReason:
            status === "CANCELLED" ? cancellationReason : current.cancellationReason,
          updatedAt: new Date()
        })
        .where(eq(workOrders.id, id));

      await tx.insert(workOrderHistory).values({
        workOrderId: id,
        previousStatus: current.status,
        newStatus: status,
        action,
        reason: cancellationReason,
        notes
      });

      const updated = await tx.query.workOrders.findFirst({
        where: eq(workOrders.id, id),
        with: {
          client: true,
          vehicle: true,
          box: true,
          appointment: true,
          items: true
        }
      });

      if (!updated) {
        return null;
      }

      return this.formatWorkOrder(updated);
    });
  }

  async addItem(
    workOrderId: number,
    item: CreateWorkOrderPersistenceItemDTO
  ): Promise<WorkOrderWithRelations | null> {
    return this.database.transaction(async (tx) => {
      const current = await tx.query.workOrders.findFirst({
        where: eq(workOrders.id, workOrderId)
      });

      if (!current) {
        return null;
      }

      await tx.insert(workOrderItems).values({
        workOrderId,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        unitPriceInCents: item.unitPriceInCents,
        quantity: item.quantity,
        totalPriceInCents: item.totalPriceInCents
      });

      const allItems = await tx.query.workOrderItems.findMany({
        where: eq(workOrderItems.workOrderId, workOrderId)
      });

      const newTotal = allItems.reduce((acc, it) => acc + it.totalPriceInCents, 0);

      await tx
        .update(workOrders)
        .set({
          totalPriceInCents: newTotal,
          updatedAt: new Date()
        })
        .where(eq(workOrders.id, workOrderId));

      await tx.insert(workOrderHistory).values({
        workOrderId,
        previousStatus: current.status,
        newStatus: current.status,
        action: "ITEM_ADDED",
        notes: `Serviço "${item.serviceName}" adicionado ao atendimento.`
      });

      const updated = await tx.query.workOrders.findFirst({
        where: eq(workOrders.id, workOrderId),
        with: {
          client: true,
          vehicle: true,
          box: true,
          appointment: true,
          items: true
        }
      });

      if (!updated) {
        return null;
      }

      return this.formatWorkOrder(updated);
    });
  }

  async removeItem(workOrderId: number, itemId: number): Promise<WorkOrderWithRelations | null> {
    return this.database.transaction(async (tx) => {
      const current = await tx.query.workOrders.findFirst({
        where: eq(workOrders.id, workOrderId)
      });

      if (!current) {
        return null;
      }

      const [removed] = await tx
        .delete(workOrderItems)
        .where(and(eq(workOrderItems.id, itemId), eq(workOrderItems.workOrderId, workOrderId)))
        .returning();

      if (!removed) {
        return null;
      }

      const allItems = await tx.query.workOrderItems.findMany({
        where: eq(workOrderItems.workOrderId, workOrderId)
      });

      const newTotal = allItems.reduce((acc, it) => acc + it.totalPriceInCents, 0);

      await tx
        .update(workOrders)
        .set({
          totalPriceInCents: newTotal,
          updatedAt: new Date()
        })
        .where(eq(workOrders.id, workOrderId));

      await tx.insert(workOrderHistory).values({
        workOrderId,
        previousStatus: current.status,
        newStatus: current.status,
        action: "ITEM_REMOVED",
        notes: `Serviço "${removed.serviceName}" removido do atendimento.`
      });

      const updated = await tx.query.workOrders.findFirst({
        where: eq(workOrders.id, workOrderId),
        with: {
          client: true,
          vehicle: true,
          box: true,
          appointment: true,
          items: true
        }
      });

      if (!updated) {
        return null;
      }

      return this.formatWorkOrder(updated);
    });
  }

  async getHistory(workOrderId: number): Promise<WorkOrderHistoryRecord[]> {
    return this.database
      .select()
      .from(workOrderHistory)
      .where(eq(workOrderHistory.workOrderId, workOrderId))
      .orderBy(asc(workOrderHistory.createdAt));
  }

  async listByClient(
    clientId: number,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedWorkOrdersOutput> {
    return this.list({
      clientId,
      page: params.page,
      limit: params.limit
    });
  }

  async listByVehicle(
    vehiclePlate: string,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedWorkOrdersOutput> {
    return this.list({
      vehiclePlate,
      page: params.page,
      limit: params.limit
    });
  }
}
