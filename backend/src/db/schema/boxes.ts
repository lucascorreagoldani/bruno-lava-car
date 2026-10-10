import { pgTable, integer, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { boxStatusEnum, BoxStatus } from "./enums/box-status.js";

export const boxes = pgTable("boxes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 60 }).notNull().unique(),
  status: boxStatusEnum("status").default("ACTIVE").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => [
  index("boxes_name_idx").on(table.name),
  index("boxes_status_idx").on(table.status)
]);

export type Box = typeof boxes.$inferSelect;
export type NewBox = typeof boxes.$inferInsert;
export { BoxStatus };
