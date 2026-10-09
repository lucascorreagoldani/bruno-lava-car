import { Worker, type Job } from "bullmq";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { notifications } from "../../db/schema/index.js";
import { getRedisClient } from "../redis/redis-client.js";
import { WhatsAppProviderFactory } from "../whatsapp/whatsapp-provider.factory.js";
import { NOTIFICATIONS_QUEUE_NAME, type NotificationJobData } from "./notification-queue.js";

let workerInstance: Worker<NotificationJobData> | null = null;

export function getNotificationWorker(): Worker<NotificationJobData> {
  if (!workerInstance) {
    const whatsAppProvider = WhatsAppProviderFactory.create();

    workerInstance = new Worker<NotificationJobData>(
      NOTIFICATIONS_QUEUE_NAME,
      async (job: Job<NotificationJobData>) => {
        const { notificationId } = job.data;

        const [notificationRecord] = await db
          .select()
          .from(notifications)
          .where(eq(notifications.id, notificationId))
          .limit(1);

        if (!notificationRecord) {
          return;
        }

        if (notificationRecord.status === "SENT") {
          return;
        }

        await db
          .update(notifications)
          .set({
            status: "PROCESSING",
            attempts: sql`${notifications.attempts} + 1`,
            updatedAt: new Date()
          })
          .where(eq(notifications.id, notificationId));

        const result = await whatsAppProvider.sendMessage({
          phone: notificationRecord.recipientPhone,
          name: notificationRecord.recipientName,
          message: notificationRecord.content
        });

        if (result.success) {
          await db
            .update(notifications)
            .set({
              status: "SENT",
              providerMessageId: result.providerMessageId || null,
              sentAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(notifications.id, notificationId));
        } else {
          await db
            .update(notifications)
            .set({
              status: "FAILED",
              errorMessage: result.errorMessage || "Falha desconhecida no provedor de mensageria",
              updatedAt: new Date()
            })
            .where(eq(notifications.id, notificationId));

          throw new Error(result.errorMessage || "Falha no envio da mensagem WhatsApp");
        }
      },
      {
        connection: getRedisClient(),
        concurrency: 5
      }
    );

    workerInstance.on("failed", (job, err) => {
      const jobId = job ? job.id : "desconhecido";
      process.stderr.write(`Job ${jobId} de notificação falhou: ${err.message}\n`);
    });
  }

  return workerInstance;
}

export async function stopNotificationWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.close();
    workerInstance = null;
  }
}
