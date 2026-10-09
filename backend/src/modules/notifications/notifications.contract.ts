import type { Notification, NewNotification } from "../../db/schema/notifications.js";
import type {
  NotificationChannel,
  NotificationStatus,
  NotificationType
} from "../../db/schema/enums/notification-status.js";
import type { PaginationQueryInput, PaginatedResult } from "../../shared/schemas/pagination.js";

export interface ListNotificationsFilter extends PaginationQueryInput {
  status?: NotificationStatus;
  type?: NotificationType;
  channel?: NotificationChannel;
  clientId?: number;
  workOrderId?: number;
  appointmentId?: number;
}

export interface SendCustomNotificationInput {
  clientId?: number;
  recipientPhone: string;
  recipientName: string;
  message: string;
  channel?: NotificationChannel;
}

export interface EnqueueNotificationInput {
  type: NotificationType;
  channel?: NotificationChannel;
  recipientPhone: string;
  recipientName: string;
  content: string;
  clientId?: number;
  vehiclePlate?: string;
  workOrderId?: number;
  appointmentId?: number;
}

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipientPhone: string;
  recipientName: string;
  content: string;
  clientId: number | null;
  vehiclePlate: string | null;
  workOrderId: number | null;
  appointmentId: number | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  attempts: number;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsRepositoryContract {
  create(data: NewNotification): Promise<Notification>;
  findById(id: number): Promise<Notification | null>;
  findMany(filter: ListNotificationsFilter): Promise<{ data: Notification[]; total: number }>;
  updateStatus(
    id: number,
    status: NotificationStatus,
    providerMessageId?: string | null,
    errorMessage?: string | null
  ): Promise<Notification | null>;
}

export interface NotificationsServiceContract {
  listNotifications(filter: ListNotificationsFilter): Promise<PaginatedResult<NotificationResponse>>;
  getNotificationById(id: number): Promise<NotificationResponse>;
  retryNotification(id: number): Promise<NotificationResponse>;
  sendCustomNotification(input: SendCustomNotificationInput): Promise<NotificationResponse>;
  enqueueAutomaticNotification(input: EnqueueNotificationInput): Promise<Notification>;
}
