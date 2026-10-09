import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { notificationQueue } from "../../shared/queue/notification-queue.js";
import { buildPaginationMeta, type PaginatedResult } from "../../shared/schemas/pagination.js";
import type { Notification } from "../../db/schema/notifications.js";
import type {
  EnqueueNotificationInput,
  ListNotificationsFilter,
  NotificationResponse,
  NotificationsRepositoryContract,
  NotificationsServiceContract,
  SendCustomNotificationInput
} from "./notifications.contract.js";

export class NotificationsService implements NotificationsServiceContract {
  constructor(private readonly notificationsRepository: NotificationsRepositoryContract) { }

  public async listNotifications(filter: ListNotificationsFilter): Promise<PaginatedResult<NotificationResponse>> {
    const { data, total } = await this.notificationsRepository.findMany(filter);
    const page = filter.page;
    const limit = filter.limit;

    return {
      data: data.map((record) => this.mapToResponse(record)),
      pagination: buildPaginationMeta(page, limit, total)
    };
  }

  public async getNotificationById(id: number): Promise<NotificationResponse> {
    const record = await this.notificationsRepository.findById(id);

    if (!record) {
      throw new NotFoundError("Notificação não encontrada.");
    }

    return this.mapToResponse(record);
  }

  public async retryNotification(id: number): Promise<NotificationResponse> {
    const record = await this.notificationsRepository.findById(id);

    if (!record) {
      throw new NotFoundError("Notificação não encontrada.");
    }

    const updated = await this.notificationsRepository.updateStatus(id, "QUEUED", null, null);

    await notificationQueue.add(
      "send-notification",
      { notificationId: id },
      {
        jobId: `retry_${id}_${Date.now()}`
      }
    );

    return this.mapToResponse(updated || record);
  }

  public async sendCustomNotification(input: SendCustomNotificationInput): Promise<NotificationResponse> {
    const created = await this.notificationsRepository.create({
      type: "CUSTOM_MESSAGE",
      channel: input.channel || "WHATSAPP",
      status: "QUEUED",
      recipientPhone: input.recipientPhone,
      recipientName: input.recipientName,
      content: input.message,
      clientId: input.clientId ?? null,
      vehiclePlate: null,
      workOrderId: null,
      appointmentId: null,
      attempts: 0
    });

    await notificationQueue.add(
      "send-notification",
      { notificationId: created.id },
      {
        jobId: `custom_${created.id}_${Date.now()}`
      }
    );

    return this.mapToResponse(created);
  }

  public async enqueueAutomaticNotification(input: EnqueueNotificationInput): Promise<Notification> {
    const created = await this.notificationsRepository.create({
      type: input.type,
      channel: input.channel || "WHATSAPP",
      status: "QUEUED",
      recipientPhone: input.recipientPhone,
      recipientName: input.recipientName,
      content: input.content,
      clientId: input.clientId ?? null,
      vehiclePlate: input.vehiclePlate ?? null,
      workOrderId: input.workOrderId ?? null,
      appointmentId: input.appointmentId ?? null,
      attempts: 0
    });

    await notificationQueue.add(
      "send-notification",
      { notificationId: created.id },
      {
        jobId: `auto_${created.id}_${Date.now()}`
      }
    );

    return created;
  }

  private mapToResponse(record: Notification): NotificationResponse {
    return {
      id: record.id,
      type: record.type,
      channel: record.channel,
      status: record.status,
      recipientPhone: record.recipientPhone,
      recipientName: record.recipientName,
      content: record.content,
      clientId: record.clientId,
      vehiclePlate: record.vehiclePlate,
      workOrderId: record.workOrderId,
      appointmentId: record.appointmentId,
      providerMessageId: record.providerMessageId,
      errorMessage: record.errorMessage,
      attempts: record.attempts,
      sentAt: record.sentAt ? record.sentAt.toISOString() : null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }
}
