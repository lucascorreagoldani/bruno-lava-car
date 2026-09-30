import { pgEnum } from "drizzle-orm/pg-core";

export const vehicleCategoryEnum = pgEnum("vehicle_category", [
  "HATCH",
  "SEDAN",
  "SUV",
  "PICKUP"
]);

export type VehicleCategory = (typeof vehicleCategoryEnum.enumValues)[number];
