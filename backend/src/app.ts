import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { globalErrorHandler } from "./shared/http/error-handler.js";
import { clientsRoutes } from "./modules/clients/clients.routes.js";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes.js";

export function buildApp(): FastifyInstance {
  const app = fastify({
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

  app.register(swagger, {
    openapi: {
      info: {
        title: "Bruno Lava Car",
        description: "API de gestão de clientes, veículos e agendamentos.",
        version: "1.0.0"
      },
      servers: [
        {
          url: "http://localhost:3333",
          description: "Servidor Principal"
        }
      ],
      tags: [
        { name: "Clientes", description: "Operações relacionadas a clientes" },
        { name: "Veículos", description: "Operações relacionadas a veículos e vinculação de clientes" }
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

  app.register(clientsRoutes);
  app.register(vehiclesRoutes);

  return app;
}