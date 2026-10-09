import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { notifications, type Notification, type NewNotification } from "../../db/schema/notifications.js";
import type { NotificationStatus } from "../../db/schema/enums/notification-status.js";
import type { ListNotificationsFilter, NotificationsRepositoryContract } from "./notifications.contract.js";

export class NotificationsRepository implements NotificationsRepositoryContract {
  public async create(data: NewNotification): Promise<Notification> {
    const [createdRecord] = await db.insert(notifications).values(data).returning();
    if (!createdRecord) {
      throw new Error("Falha ao registrar notificação no banco de dados.");
    }
    return createdRecord;
  }

  public async findById(id: number): Promise<Notification | null> {
    const [record] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);

    return record || null;
  }

  public async findMany(filter: ListNotificationsFilter): Promise<{ data: Notification[]; total: number }> {
    const conditions = [];

    if (filter.status) {
      conditions.push(eq(notifications.status, filter.status));
    }

    if (filter.type) {
      conditions.push(eq(notifications.type, filter.type));
    }

    if (filter.channel) {
      conditions.push(eq(notifications.channel, filter.channel));
    }

    if (filter.clientId) {
      conditions.push(eq(notifications.clientId, filter.clientId));
    }

    if (filter.workOrderId) {
      conditions.push(eq(notifications.workOrderId, filter.workOrderId));
    }

    if (filter.appointmentId) {
      conditions.push(eq(notifications.appointmentId, filter.appointmentId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ value: count() })
      .from(notifications)
      .where(whereClause);

    const total = totalResult ? Number(totalResult.value) : 0;

    const page = filter.page;
    const limit = filter.limit;
    const offset = (page - 1) * limit;

    const data = await db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  public async updateStatus(
    id: number,
    status: NotificationStatus,
    providerMessageId?: string | null,
    errorMessage?: string | null
  ): Promise<Notification | null> {
    const [updatedRecord] = await db
      .update(notifications)
      .set({
        status,
        providerMessageId: providerMessageId ?? undefined,
        errorMessage: errorMessage ?? undefined,
        updatedAt: new Date()
      })
      .where(eq(notifications.id, id))
      .returning();

    return updatedRecord || null;
  }
}
