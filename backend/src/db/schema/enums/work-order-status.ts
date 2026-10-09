import { pgEnum } from "drizzle-orm/pg-core";

export const workOrderStatusEnum = pgEnum("work_order_status", [
  "CHECK_IN",
  "IN_PROGRESS",
  "FINISHING",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED"
]);

export type WorkOrderStatus = (typeof workOrderStatusEnum.enumValues)[number];

export const workOrderHistoryActionEnum = pgEnum("work_order_history_action", [
  "CREATED",
  "STATUS_CHANGED",
  "ITEM_ADDED",
  "ITEM_REMOVED",
  "CANCELLED",
  "DELIVERED"
]);

export type WorkOrderHistoryAction = (typeof workOrderHistoryActionEnum.enumValues)[number];
