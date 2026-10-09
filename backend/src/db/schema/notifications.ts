import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { notificationChannelEnum, notificationStatusEnum, notificationTypeEnum } from "./enums/notification-status.js";
import { clients } from "./clients.js";
import { vehicles } from "./vehicles.js";
import { workOrders } from "./work-orders.js";
import { appointments } from "./appointments.js";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  channel: notificationChannelEnum("channel").notNull().default("WHATSAPP"),
  status: notificationStatusEnum("status").notNull().default("QUEUED"),
  recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
  recipientName: varchar("recipient_name", { length: 150 }).notNull(),
  content: text("content").notNull(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  vehiclePlate: varchar("vehicle_plate", { length: 10 }).references(() => vehicles.plate, { onDelete: "set null" }),
  workOrderId: integer("work_order_id").references(() => workOrders.id, { onDelete: "set null" }),
  appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  providerMessageId: varchar("provider_message_id", { length: 100 }),
  errorMessage: text("error_message"),
  attempts: integer("attempts").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  client: one(clients, {
    fields: [notifications.clientId],
    references: [clients.id]
  }),
  vehicle: one(vehicles, {
    fields: [notifications.vehiclePlate],
    references: [vehicles.plate]
  }),
  workOrder: one(workOrders, {
    fields: [notifications.workOrderId],
    references: [workOrders.id]
  }),
  appointment: one(appointments, {
    fields: [notifications.appointmentId],
    references: [appointments.id]
  })
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
