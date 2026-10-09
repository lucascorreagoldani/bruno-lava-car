import { FastifyInstance } from "fastify";
import { NotificationsRepository } from "./notifications.repository.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationsController } from "./notifications.controller.js";

export async function notificationsRoutes(app: FastifyInstance) {
  const notificationsRepository = new NotificationsRepository();
  const notificationsService = new NotificationsService(notificationsRepository);
  const notificationsController = new NotificationsController(notificationsService);

  app.get(
    "/notifications",
    {
      schema: {
        tags: ["Notificações & WhatsApp"],
        summary: "Listar notificações",
        description: "Recupera lista paginada de notificações com filtros por status, tipo, canal, cliente ou OS.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20 },
            status: { type: "string", enum: ["QUEUED", "PROCESSING", "SENT", "FAILED"] },
            type: {
              type: "string",
              enum: [
                "APPOINTMENT_CONFIRMED",
                "WORK_ORDER_STARTED",
                "WORK_ORDER_READY",
                "WORK_ORDER_DELIVERED",
                "CUSTOM_MESSAGE"
              ]
            },
            channel: { type: "string", enum: ["WHATSAPP", "SMS", "WEBHOOK"] },
            clientId: { type: "integer" },
            workOrderId: { type: "integer" },
            appointmentId: { type: "integer" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              message: { type: "string" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    type: { type: "string" },
                    channel: { type: "string" },
                    status: { type: "string" },
                    recipientPhone: { type: "string" },
                    recipientName: { type: "string" },
                    content: { type: "string" },
                    clientId: { type: "number", nullable: true },
                    vehiclePlate: { type: "string", nullable: true },
                    workOrderId: { type: "number", nullable: true },
                    appointmentId: { type: "number", nullable: true },
                    providerMessageId: { type: "string", nullable: true },
                    errorMessage: { type: "string", nullable: true },
                    attempts: { type: "number" },
                    sentAt: { type: "string", nullable: true },
                    createdAt: { type: "string" },
                    updatedAt: { type: "string" }
                  }
                }
              },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "number" },
                  limit: { type: "number" },
                  total: { type: "number" },
                  totalPages: { type: "number" }
                }
              }
            }
          }
        }
      }
    },
    notificationsController.list
  );

  app.get(
    "/notifications/:id",
    {
      schema: {
        tags: ["Notificações & WhatsApp"],
        summary: "Buscar notificação por ID",
        description: "Recupera os detalhes, payload e status de envio de uma notificação específica.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  type: { type: "string" },
                  channel: { type: "string" },
                  status: { type: "string" },
                  recipientPhone: { type: "string" },
                  recipientName: { type: "string" },
                  content: { type: "string" },
                  clientId: { type: "number", nullable: true },
                  vehiclePlate: { type: "string", nullable: true },
                  workOrderId: { type: "number", nullable: true },
                  appointmentId: { type: "number", nullable: true },
                  providerMessageId: { type: "string", nullable: true },
                  errorMessage: { type: "string", nullable: true },
                  attempts: { type: "number" },
                  sentAt: { type: "string", nullable: true },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    notificationsController.getById
  );

  app.post(
    "/notifications/:id/retry",
    {
      schema: {
        tags: ["Notificações & WhatsApp"],
        summary: "Reenfileirar notificação com falha",
        description: "Reinsere a notificação na fila do BullMQ para nova tentativa de envio.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  status: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    notificationsController.retry
  );

  app.post(
    "/notifications/send-custom",
    {
      schema: {
        tags: ["Notificações & WhatsApp"],
        summary: "Enviar mensagem personalizada",
        description: "Enfileira uma mensagem manual/customizada para o WhatsApp do cliente.",
        body: {
          type: "object",
          required: ["recipientPhone", "recipientName", "message"],
          properties: {
            recipientPhone: { type: "string", example: "+5555996558820" },
            recipientName: { type: "string", example: "Lucas Corrêa Goldani" },
            message: { type: "string", example: "Olá Lucas, seu veículo passará pelo polimento agora!" },
            clientId: { type: "integer", example: 1 },
            channel: { type: "string", enum: ["WHATSAPP", "SMS", "WEBHOOK"], default: "WHATSAPP" }
          }
        },
        response: {
          201: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  type: { type: "string" },
                  channel: { type: "string" },
                  status: { type: "string" },
                  recipientPhone: { type: "string" },
                  recipientName: { type: "string" },
                  content: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    notificationsController.sendCustom
  );
}
