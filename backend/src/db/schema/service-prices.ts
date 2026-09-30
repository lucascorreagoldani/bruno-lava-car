import { pgTable, integer, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { vehicleCategoryEnum } from "./enums/vehicle-category.js";
import { services } from "./services.js";

export const servicePrices = pgTable("service_prices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  category: vehicleCategoryEnum("category").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  uniqueIndex("service_prices_service_category_idx").on(table.serviceId, table.category),
  index("service_prices_service_id_idx").on(table.serviceId)
]);

export const servicePricesRelations = relations(servicePrices, ({ one }) => ({
  service: one(services, {
    fields: [servicePrices.serviceId],
    references: [services.id]
  })
}));

export type ServicePrice = typeof servicePrices.$inferSelect;
export type NewServicePrice = typeof servicePrices.$inferInsert;
