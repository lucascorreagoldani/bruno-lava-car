import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { workOrderStatusEnum } from "./enums/work-order-status.js";
import { clients } from "./clients.js";
import { vehicles } from "./vehicles.js";
import { boxes } from "./boxes.js";
import { appointments } from "./appointments.js";
import { workOrderItems } from "./work-order-items.js";
import { workOrderHistory } from "./work-order-history.js";

export const workOrders = pgTable(
  "work_orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 30 }).notNull().unique(),
    appointmentId: integer("appointment_id").references(() => appointments.id, {
      onDelete: "set null"
    }),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    vehiclePlate: varchar("vehicle_plate", { length: 10 })
      .notNull()
      .references(() => vehicles.plate, { onDelete: "restrict" }),
    boxId: integer("box_id")
      .notNull()
      .references(() => boxes.id, { onDelete: "restrict" }),
    status: workOrderStatusEnum("status").notNull().default("CHECK_IN"),
    totalPriceInCents: integer("total_price_in_cents").notNull().default(0),
    notes: text("notes"),
    cancellationReason: text("cancellation_reason"),
    checkInAt: timestamp("check_in_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("idx_work_orders_status").on(table.status),
    index("idx_work_orders_client").on(table.clientId),
    index("idx_work_orders_vehicle").on(table.vehiclePlate),
    index("idx_work_orders_box").on(table.boxId),
    index("idx_work_orders_check_in").on(table.checkInAt)
  ]
);

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  client: one(clients, {
    fields: [workOrders.clientId],
    references: [clients.id]
  }),
  vehicle: one(vehicles, {
    fields: [workOrders.vehiclePlate],
    references: [vehicles.plate]
  }),
  box: one(boxes, {
    fields: [workOrders.boxId],
    references: [boxes.id]
  }),
  appointment: one(appointments, {
    fields: [workOrders.appointmentId],
    references: [appointments.id]
  }),
  items: many(workOrderItems),
  history: many(workOrderHistory)
}));

export type WorkOrder = typeof workOrders.$inferSelect;
export type NewWorkOrder = typeof workOrders.$inferInsert;
