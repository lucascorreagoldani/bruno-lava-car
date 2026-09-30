import { pgTable, integer, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { servicePrices } from "./service-prices.js";

export const services = pgTable("services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("services_name_idx").on(table.name),
  index("services_active_idx").on(table.active)
]);

export const servicesRelations = relations(services, ({ many }) => ({
  prices: many(servicePrices)
}));

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
