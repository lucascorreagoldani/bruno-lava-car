import { FastifyInstance } from "fastify";
import { db } from "../../db/connection.js";
import { DrizzleBoxesRepository } from "./boxes.repository.js";
import { BoxesService } from "./boxes.service.js";
import { BoxesController } from "./boxes.controller.js";

export async function boxesRoutes(app: FastifyInstance) {
  const boxesRepository = new DrizzleBoxesRepository(db);
  const boxesService = new BoxesService(boxesRepository);
  const boxesController = new BoxesController(boxesService);

  app.post(
    "/boxes",
    {
      schema: {
        tags: ["Boxes"],
        summary: "Cadastrar novo box de atendimento",
        description: "Registra um novo box físico para lavagem ou estética automotiva.",
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Box 1 - Ducha Rápida" },
            status: {
              type: "string",
              enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"],
              default: "ACTIVE",
              example: "ACTIVE"
            },
            description: {
              type: "string",
              example: "Box dedicado à lavagem rápida com bomba de alta pressão."
            }
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
                  name: { type: "string" },
                  status: { type: "string" },
                  description: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => boxesController.create(request, reply)
  );

  app.get(
    "/boxes",
    {
      schema: {
        tags: ["Boxes"],
        summary: "Listar boxes de atendimento",
        description: "Retorna todos os boxes com opções de filtro por status e busca por nome.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1, minimum: 1 },
            limit: { type: "number", default: 20, minimum: 1, maximum: 100 },
            status: {
              type: "string",
              enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"]
            },
            search: { type: "string" }
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
                    name: { type: "string" },
                    status: { type: "string" },
                    description: { type: "string" },
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
    (request, reply) => boxesController.list(request, reply)
  );

  app.get(
    "/boxes/:id",
    {
      schema: {
        tags: ["Boxes"],
        summary: "Buscar box por ID",
        description: "Retorna os detalhes de um box de atendimento específico.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
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
                  name: { type: "string" },
                  status: { type: "string" },
                  description: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => boxesController.getById(request, reply)
  );

  app.put(
    "/boxes/:id",
    {
      schema: {
        tags: ["Boxes"],
        summary: "Atualizar dados do box",
        description: "Atualiza o nome, status e/ou descrição de um box de atendimento.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", example: "Box 1 - Ducha Premium" },
            status: {
              type: "string",
              enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"]
            },
            description: { type: "string" }
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
                  name: { type: "string" },
                  status: { type: "string" },
                  description: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => boxesController.update(request, reply)
  );

  app.patch(
    "/boxes/:id/status",
    {
      schema: {
        tags: ["Boxes"],
        summary: "Alterar status operacional do box",
        description: "Atualiza o status operacional do box (ACTIVE, MAINTENANCE, INACTIVE).",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["ACTIVE", "MAINTENANCE", "INACTIVE"],
              example: "MAINTENANCE"
            }
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
                  name: { type: "string" },
                  status: { type: "string" },
                  description: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => boxesController.updateStatus(request, reply)
  );

  app.delete(
    "/boxes/:id",
    {
      schema: {
        tags: ["Boxes"],
        summary: "Remover box de atendimento",
        description: "Remove um box do sistema.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              statusCode: { type: "number" },
              message: { type: "string" }
            }
          }
        }
      }
    },
    (request, reply) => boxesController.delete(request, reply)
  );
}
