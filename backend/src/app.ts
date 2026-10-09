import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { globalErrorHandler } from "./shared/http/error-handler.js";
import { clientsRoutes } from "./modules/clients/clients.routes.js";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes.js";
import { servicesRoutes } from "./modules/services/services.routes.js";
import { boxesRoutes } from "./modules/boxes/boxes.routes.js";
import { appointmentsRoutes } from "./modules/appointments/appointments.routes.js";
import { workOrdersRoutes } from "./modules/work-orders/work-orders.routes.js";
import { notificationsRoutes } from "./modules/notifications/notifications.routes.js";
import { getNotificationWorker, stopNotificationWorker } from "./shared/queue/notification-worker.js";

export function buildApp(): FastifyInstance {
  const app = fastify({
    ajv: {
      customOptions: {
        strict: false
      }
    },
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname"
            }
          }
    }
  });

  app.setErrorHandler(globalErrorHandler);

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  });

  app.addHook("preHandler", async (request, reply) => {
    const rawUrl = request.raw.url || "";
    const [pathname = "", search] = rawUrl.split("?");
    const legacyPrefixes = [
      "/clients",
      "/vehicles",
      "/services",
      "/boxes",
      "/appointments",
      "/work-orders",
      "/notifications"
    ];
    const isLegacy = legacyPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (isLegacy && !pathname.startsWith("/v1")) {
      const target = `/v1${pathname}${search ? `?${search}` : ""}`;
      return reply.redirect(target, 308);
    }
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: "Bruno Lava Car",
        description:
          "API de gestão de clientes, veículos, serviços, boxes, agendamentos, ordens de serviço e notificações.",
        version: "1.0.0"
      },
      servers: [
        {
          url: "/",
          description: "Servidor Principal"
        }
      ],
      tags: [
        { name: "Clientes", description: "Operações relacionadas a clientes" },
        { name: "Veículos", description: "Operações relacionadas a veículos e vinculação de clientes" },
        { name: "Serviços", description: "Catálogo de serviços e precificação por categoria de veículo" },
        { name: "Boxes", description: "Gestão dos boxes físicos de atendimento e status operacional" },
        { name: "Agendamentos", description: "Controle de agendamentos, concorrência de boxes e linha do tempo" },
        { name: "Ordens de Serviço", description: "Controle de execução física, fases do atendimento e itens de serviço" },
        { name: "Notificações & WhatsApp", description: "Disparos automáticos, mensagens no WhatsApp e auditoria de envio" }
      ]
    }
  });

  app.register(swaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true
    }
  });

  app.get("/health", {
    schema: {
      summary: "Healthcheck da API",
      tags: ["Sistema"],
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" }
          }
        }
      }
    }
  }, async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  });

  app.register(clientsRoutes, { prefix: "/v1" });
  app.register(vehiclesRoutes, { prefix: "/v1" });
  app.register(servicesRoutes, { prefix: "/v1" });
  app.register(boxesRoutes, { prefix: "/v1" });
  app.register(appointmentsRoutes, { prefix: "/v1" });
  app.register(workOrdersRoutes, { prefix: "/v1" });
  app.register(notificationsRoutes, { prefix: "/v1" });

  getNotificationWorker();

  app.addHook("onClose", async () => {
    await stopNotificationWorker();
  });

  return app;
}