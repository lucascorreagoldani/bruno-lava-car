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
import { workOrders } from "./work-orders.js";
import { workOrderHistoryActionEnum } from "./enums/work-order-status.js";

export const workOrderHistory = pgTable(
  "work_order_history",
  {
    id: serial("id").primaryKey(),
    workOrderId: integer("work_order_id")
      .notNull()
      .references(() => workOrders.id, { onDelete: "cascade" }),
    previousStatus: varchar("previous_status", { length: 30 }),
    newStatus: varchar("new_status", { length: 30 }).notNull(),
    action: workOrderHistoryActionEnum("action").notNull(),
    reason: text("reason"),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("idx_work_order_history_order").on(table.workOrderId, table.createdAt)
  ]
);

export const workOrderHistoryRelations = relations(workOrderHistory, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderHistory.workOrderId],
    references: [workOrders.id]
  })
}));

export type WorkOrderHistoryRecord = typeof workOrderHistory.$inferSelect;
export type NewWorkOrderHistoryRecord = typeof workOrderHistory.$inferInsert;
