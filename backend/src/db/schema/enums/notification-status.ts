import { pgEnum } from "drizzle-orm/pg-core";

export const notificationStatusEnum = pgEnum("notification_status", [
  "QUEUED",
  "PROCESSING",
  "SENT",
  "FAILED"
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "APPOINTMENT_CONFIRMED",
  "WORK_ORDER_STARTED",
  "WORK_ORDER_READY",
  "WORK_ORDER_DELIVERED",
  "CUSTOM_MESSAGE"
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "WHATSAPP",
  "SMS",
  "WEBHOOK"
]);

export type NotificationStatus = (typeof notificationStatusEnum.enumValues)[number];
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type NotificationChannel = (typeof notificationChannelEnum.enumValues)[number];
