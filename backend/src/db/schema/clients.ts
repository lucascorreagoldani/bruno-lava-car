import { pgTable, integer, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { vehicles } from "./vehicles.js";

export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("clients_phone_idx").on(table.phone),
  index("clients_full_name_idx").on(table.fullName)
]);

export const clientsRelations = relations(clients, ({ many }) => ({
  vehicles: many(vehicles)
}));

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
