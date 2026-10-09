import { pgEnum } from "drizzle-orm/pg-core";

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "SCHEDULED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED"
]);

export type AppointmentStatus = (typeof appointmentStatusEnum.enumValues)[number];

export const appointmentHistoryActionEnum = pgEnum("appointment_history_action", [
  "CREATED",
  "STATUS_CHANGED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED"
]);

export type AppointmentHistoryAction = (typeof appointmentHistoryActionEnum.enumValues)[number];
