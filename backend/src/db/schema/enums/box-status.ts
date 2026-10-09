import { pgEnum } from "drizzle-orm/pg-core";

export const boxStatusEnum = pgEnum("box_status", [
  "ACTIVE",
  "MAINTENANCE",
  "INACTIVE"
]);

export type BoxStatus = (typeof boxStatusEnum.enumValues)[number];
