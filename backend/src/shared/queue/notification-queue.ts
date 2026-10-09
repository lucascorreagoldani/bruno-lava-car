import { Queue } from "bullmq";
import { getRedisClient } from "../redis/redis-client.js";

export const NOTIFICATIONS_QUEUE_NAME = "notifications-queue";

export interface NotificationJobData {
  notificationId: number;
}

export const notificationQueue = new Queue<NotificationJobData>(NOTIFICATIONS_QUEUE_NAME, {
  connection: getRedisClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    },
    removeOnComplete: 200,
    removeOnFail: 500
  }
});
