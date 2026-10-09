import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { services } from "./services.js";
import { workOrders } from "./work-orders.js";

export const workOrderItems = pgTable(
  "work_order_items",
  {
    id: serial("id").primaryKey(),
    workOrderId: integer("work_order_id")
      .notNull()
      .references(() => workOrders.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    serviceName: varchar("service_name", { length: 100 }).notNull(),
    unitPriceInCents: integer("unit_price_in_cents").notNull(),
    quantity: integer("quantity").notNull().default(1),
    totalPriceInCents: integer("total_price_in_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("idx_work_order_items_order").on(table.workOrderId)
  ]
);

export const workOrderItemsRelations = relations(workOrderItems, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderItems.workOrderId],
    references: [workOrders.id]
  }),
  service: one(services, {
    fields: [workOrderItems.serviceId],
    references: [services.id]
  })
}));

export type WorkOrderItem = typeof workOrderItems.$inferSelect;
export type NewWorkOrderItem = typeof workOrderItems.$inferInsert;
