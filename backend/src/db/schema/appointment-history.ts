import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index,
  jsonb
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { appointments } from "./appointments.js";
import { appointmentHistoryActionEnum } from "./enums/appointment-status.js";

export const appointmentHistory = pgTable(
  "appointment_history",
  {
    id: serial("id").primaryKey(),
    appointmentId: integer("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    previousStatus: varchar("previous_status", { length: 30 }),
    newStatus: varchar("new_status", { length: 30 }).notNull(),
    action: appointmentHistoryActionEnum("action").notNull(),
    reason: text("reason"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("idx_appointment_history_appointment").on(table.appointmentId, table.createdAt)
  ]
);

export const appointmentHistoryRelations = relations(appointmentHistory, ({ one }) => ({
  appointment: one(appointments, {
    fields: [appointmentHistory.appointmentId],
    references: [appointments.id]
  })
}));

export type AppointmentHistoryRecord = typeof appointmentHistory.$inferSelect;
export type NewAppointmentHistoryRecord = typeof appointmentHistory.$inferInsert;
