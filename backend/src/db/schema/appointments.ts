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
import { appointmentStatusEnum } from "./enums/appointment-status.js";
import { clients } from "./clients.js";
import { vehicles } from "./vehicles.js";
import { services } from "./services.js";
import { boxes } from "./boxes.js";
import { appointmentHistory } from "./appointment-history.js";

export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    vehiclePlate: varchar("vehicle_plate", { length: 10 })
      .notNull()
      .references(() => vehicles.plate, { onDelete: "restrict" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    boxId: integer("box_id")
      .notNull()
      .references(() => boxes.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    estimatedEndAt: timestamp("estimated_end_at", { withTimezone: true }).notNull(),
    priceInCents: integer("price_in_cents").notNull(),
    status: appointmentStatusEnum("status").notNull().default("SCHEDULED"),
    notes: text("notes"),
    cancellationReason: text("cancellation_reason"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("idx_appointments_box_interval").on(table.boxId, table.scheduledAt, table.estimatedEndAt),
    index("idx_appointments_client").on(table.clientId),
    index("idx_appointments_vehicle").on(table.vehiclePlate),
    index("idx_appointments_status").on(table.status)
  ]
);

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id]
  }),
  vehicle: one(vehicles, {
    fields: [appointments.vehiclePlate],
    references: [vehicles.plate]
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id]
  }),
  box: one(boxes, {
    fields: [appointments.boxId],
    references: [boxes.id]
  }),
  history: many(appointmentHistory)
}));

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
