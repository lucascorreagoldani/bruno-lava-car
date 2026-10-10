import { pgTable, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clients } from "./clients.js";
import { vehicleCategoryEnum } from "./enums/index.js";

export const vehicles = pgTable("vehicles", {
  plate: varchar("plate", { length: 10 }).primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade", onUpdate: "cascade" }),
  brand: varchar("brand", { length: 50 }).notNull(),
  model: varchar("model", { length: 80 }).notNull(),
  color: varchar("color", { length: 30 }).notNull(),
  year: integer("year"),
  category: vehicleCategoryEnum("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("vehicles_client_id_idx").on(table.clientId),
  index("vehicles_category_idx").on(table.category)
]);

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  client: one(clients, {
    fields: [vehicles.clientId],
    references: [clients.id]
  })
}));

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export { type VehicleCategory, vehicleCategoryEnum } from "./enums/index.js";
