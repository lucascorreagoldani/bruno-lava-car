import { FastifyInstance } from "fastify";
import { db } from "../../db/connection.js";
import { DrizzleClientsRepository } from "./clients.repository.js";
import { ClientsService } from "./clients.service.js";
import { ClientsController } from "./clients.controller.js";

export async function clientsRoutes(app: FastifyInstance) {
  const clientsRepository = new DrizzleClientsRepository(db);
  const clientsService = new ClientsService(clientsRepository);
  const clientsController = new ClientsController(clientsService);

  app.post(
    "/clients",
    {
      schema: {
        tags: ["Clientes"],
        summary: "Cadastrar novo cliente",
        description: "Registra um novo cliente.",
        body: {
          type: "object",
          required: ["fullName", "phone"],
          properties: {
            fullName: { type: "string", example: "Lucas Corrêa Goldani" },
            phone: { type: "string", example: "(+55) 55 9 9655-8820" }
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
                  fullName: { type: "string" },
                  phone: { type: "string" },
                  formattedPhone: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => clientsController.create(request, reply)
  );

  app.get(
    "/clients",
    {
      schema: {
        tags: ["Clientes"],
        summary: "Listar clientes",
        description: "Lista clientes cadastrados.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 10 },
            search: { type: "string" }
          }
        }
      }
    },
    (request, reply) => clientsController.list(request, reply)
  );

  app.get(
    "/clients/:id",
    {
      schema: {
        tags: ["Clientes"],
        summary: "Buscar cliente por ID",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        }
      }
    },
    (request, reply) => clientsController.getById(request, reply)
  );

  app.get(
    "/clients/:id/vehicles",
    {
      schema: {
        tags: ["Clientes"],
        summary: "Listar veículos de um cliente",
        description: "Retorna todos os veículos vinculados a este cliente.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        }
      }
    },
    (request, reply) => clientsController.getVehicles(request, reply)
  );
}
