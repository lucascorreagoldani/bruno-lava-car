import { z } from "zod";
import { paginationQuerySchema } from "../../shared/schemas/pagination.js";
import { phoneSchema } from "../../shared/validators/phone-validator.js";

export const notificationIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID da notificação deve ser um número inteiro positivo")
});

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["QUEUED", "PROCESSING", "SENT", "FAILED"]).optional(),
  type: z
    .enum([
      "APPOINTMENT_CONFIRMED",
      "WORK_ORDER_STARTED",
      "WORK_ORDER_READY",
      "WORK_ORDER_DELIVERED",
      "CUSTOM_MESSAGE"
    ])
    .optional(),
  channel: z.enum(["WHATSAPP", "SMS", "WEBHOOK"]).optional(),
  clientId: z.coerce.number().int().positive().optional(),
  workOrderId: z.coerce.number().int().positive().optional(),
  appointmentId: z.coerce.number().int().positive().optional()
});

export const sendCustomNotificationBodySchema = z.object({
  recipientPhone: phoneSchema,
  recipientName: z
    .string({ required_error: "Nome do destinatário é obrigatório" })
    .trim()
    .min(2, "Nome do destinatário deve ter no mínimo 2 caracteres")
    .max(150, "Nome do destinatário deve ter no máximo 150 caracteres"),
  message: z
    .string({ required_error: "Mensagem é obrigatória" })
    .trim()
    .min(1, "Mensagem não pode ser vazia")
    .max(2000, "Mensagem não pode exceder 2000 caracteres"),
  clientId: z.number().int().positive().optional(),
  channel: z.enum(["WHATSAPP", "SMS", "WEBHOOK"]).default("WHATSAPP")
});

export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type SendCustomNotificationBody = z.infer<typeof sendCustomNotificationBodySchema>;
