import { FastifyInstance } from "fastify";
import { db } from "../../db/connection.js";
import { DrizzleServicesRepository } from "./services.repository.js";
import { ServicesService } from "./services.service.js";
import { ServicesController } from "./services.controller.js";

export async function servicesRoutes(app: FastifyInstance) {
  const servicesRepository = new DrizzleServicesRepository(db);
  const servicesService = new ServicesService(servicesRepository);
  const servicesController = new ServicesController(servicesService);

  app.post(
    "/services",
    {
      schema: {
        tags: ["Serviços"],
        summary: "Cadastrar novo serviço",
        description: "Registra um novo serviço com sua matriz de preços por categoria em transação atômica.",
        body: {
          type: "object",
          required: ["name", "durationMinutes", "prices"],
          properties: {
            name: { type: "string", example: "Lavagem Simples" },
            description: {
              type: "string",
              example: "Ducha de alta pressão, lavagem com shampoo neutro, secagem e aspiração interna básica."
            },
            durationMinutes: { type: "number", example: 45 },
            prices: {
              type: "array",
              items: {
                type: "object",
                required: ["category", "priceInCents"],
                properties: {
                  category: {
                    type: "string",
                    enum: ["HATCH", "SEDAN", "SUV", "PICKUP"],
                    example: "SEDAN"
                  },
                  priceInCents: { type: "number", example: 6000 }
                }
              }
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
                  description: { type: "string" },
                  durationMinutes: { type: "number" },
                  active: { type: "boolean" },
                  prices: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        serviceId: { type: "number" },
                        category: { type: "string" },
                        priceInCents: { type: "number" },
                        formattedPrice: { type: "string" },
                        createdAt: { type: "string" },
                        updatedAt: { type: "string" }
                      }
                    }
                  },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => servicesController.create(request, reply)
  );

  app.get(
    "/services",
    {
      schema: {
        tags: ["Serviços"],
        summary: "Listar serviços",
        description: "Lista todos os serviços cadastrados e suas matrizes de preços por categoria.",
        querystring: {
          type: "object",
          properties: {
            active: { type: "boolean" },
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
                    description: { type: "string" },
                    durationMinutes: { type: "number" },
                    active: { type: "boolean" },
                    prices: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          serviceId: { type: "number" },
                          category: { type: "string" },
                          priceInCents: { type: "number" },
                          formattedPrice: { type: "string" }
                        }
                      }
                    },
                    createdAt: { type: "string" },
                    updatedAt: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => servicesController.list(request, reply)
  );

  app.get(
    "/services/:id",
    {
      schema: {
        tags: ["Serviços"],
        summary: "Buscar serviço por ID",
        description: "Retorna as informações completas de um serviço e sua tabela de preços.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        }
      }
    },
    (request, reply) => servicesController.getById(request, reply)
  );

  app.get(
    "/services/:id/calculate-price",
    {
      schema: {
        tags: ["Serviços"],
        summary: "Consultar preço por categoria",
        description: "Calcula e retorna o preço exato e a duração estimada do serviço para a categoria informada.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        },
        querystring: {
          type: "object",
          required: ["category"],
          properties: {
            category: {
              type: "string",
              enum: ["HATCH", "SEDAN", "SUV", "PICKUP"],
              example: "SEDAN"
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
                  serviceId: { type: "number" },
                  serviceName: { type: "string" },
                  durationMinutes: { type: "number" },
                  category: { type: "string" },
                  priceInCents: { type: "number" },
                  formattedPrice: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => servicesController.calculatePrice(request, reply)
  );

  app.put(
    "/services/:id",
    {
      schema: {
        tags: ["Serviços"],
        summary: "Atualizar serviço",
        description: "Atualiza informações do serviço e/ou sua matriz de preços.",
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
            name: { type: "string", example: "Lavagem Simples" },
            description: { type: "string" },
            durationMinutes: { type: "number", example: 50 },
            active: { type: "boolean" },
            prices: {
              type: "array",
              items: {
                type: "object",
                required: ["category", "priceInCents"],
                properties: {
                  category: {
                    type: "string",
                    enum: ["HATCH", "SEDAN", "SUV", "PICKUP"]
                  },
                  priceInCents: { type: "number" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => servicesController.update(request, reply)
  );

  app.patch(
    "/services/:id/toggle-active",
    {
      schema: {
        tags: ["Serviços"],
        summary: "Alternar status ativo/inativo",
        description: "Altera o status de disponibilidade do serviço no catálogo.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        }
      }
    },
    (request, reply) => servicesController.toggleActive(request, reply)
  );

  app.delete(
    "/services/:id",
    {
      schema: {
        tags: ["Serviços"],
        summary: "Remover serviço",
        description: "Remove um serviço e seus preços associados em cascata.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        }
      }
    },
    (request, reply) => servicesController.delete(request, reply)
  );
}
