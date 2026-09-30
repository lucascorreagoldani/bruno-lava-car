import { FastifyInstance } from "fastify";
import { db } from "../../db/connection.js";
import { DrizzleVehiclesRepository } from "./vehicles.repository.js";
import { DrizzleClientsRepository } from "../clients/clients.repository.js";
import { VehiclesService } from "./vehicles.service.js";
import { VehiclesController } from "./vehicles.controller.js";
import {
  KNOWN_VEHICLE_BRANDS,
  KNOWN_VEHICLE_COLORS,
  getModelsForBrand,
  catalogQuerySchema
} from "./vehicles.schema.js";

export async function vehiclesRoutes(app: FastifyInstance) {
  const vehiclesRepository = new DrizzleVehiclesRepository(db);
  const clientsRepository = new DrizzleClientsRepository(db);
  const vehiclesService = new VehiclesService(vehiclesRepository, clientsRepository);
  const vehiclesController = new VehiclesController(vehiclesService);

  app.get(
    "/vehicles/catalog",
    {
      schema: {
        tags: ["Veículos"],
        summary: "Obter catálogo de marcas, modelos e cores",
        description: "Retorna a lista de marcas, cores e os modelos da marca informada.",
        querystring: {
          type: "object",
          properties: {
            brand: { type: "string", description: "Marca para filtrar os modelos" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              brands: { type: "array", items: { type: "string" } },
              colors: { type: "array", items: { type: "string" } },
              models: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const { brand } = catalogQuerySchema.parse(request.query);
      const models = brand ? getModelsForBrand(brand) : [];

      return reply.status(200).send({
        brands: KNOWN_VEHICLE_BRANDS,
        colors: KNOWN_VEHICLE_COLORS,
        models
      });
    }
  );

  app.get(
    "/vehicles",
    {
      schema: {
        tags: ["Veículos"],
        summary: "Listar veículos",
        description: "Lista veículos cadastrados.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 10 },
            search: { type: "string" },
            brand: { type: "string" },
            category: { type: "string", enum: ["HATCH", "SEDAN", "SUV", "PICKUP"] },
            clientId: { type: "number" }
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
                    vehicle: {
                      type: "object",
                      properties: {
                        plate: { type: "string" },
                        formattedPlate: { type: "string" },
                        clientId: { type: "number" },
                        brand: { type: "string" },
                        model: { type: "string" },
                        color: { type: "string" },
                        year: { type: "number" },
                        category: { type: "string" },
                        createdAt: { type: "string" },
                        updatedAt: { type: "string" }
                      }
                    },
                    client: {
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
    (request, reply) => vehiclesController.list(request, reply)
  );

  app.post(
    "/vehicles",
    {
      schema: {
        tags: ["Veículos"],
        summary: "Cadastrar novo veículo",
        description: "Cadastra um veículo validando o formato da placa (Mercosul | Tradicional).",
        body: {
          type: "object",
          required: ["plate", "clientId", "brand", "model", "color", "category"],
          properties: {
            plate: { type: "string", example: "BRA2E19" },
            clientId: { type: "number", example: 1 },
            brand: { type: "string", enum: [...KNOWN_VEHICLE_BRANDS], example: "Honda" },
            model: { type: "string", example: "Civic G10" },
            color: { type: "string", enum: [...KNOWN_VEHICLE_COLORS], example: "Preto" },
            year: { type: "number", example: 2021 },
            category: { type: "string", enum: ["HATCH", "SEDAN", "SUV", "PICKUP"], example: "SEDAN" }
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
                  plate: { type: "string" },
                  formattedPlate: { type: "string" },
                  clientId: { type: "number" },
                  brand: { type: "string" },
                  model: { type: "string" },
                  color: { type: "string" },
                  year: { type: "number" },
                  category: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => vehiclesController.create(request, reply)
  );

  app.get(
    "/vehicles/:plate",
    {
      schema: {
        tags: ["Veículos"],
        summary: "Buscar veículo por placa",
        description: "Retorna as informações do veículo e do seu respectivo cliente.",
        params: {
          type: "object",
          required: ["plate"],
          properties: {
            plate: { type: "string", example: "BRA2E19" }
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
                  vehicle: {
                    type: "object",
                    properties: {
                      plate: { type: "string" },
                      formattedPlate: { type: "string" },
                      clientId: { type: "number" },
                      brand: { type: "string" },
                      model: { type: "string" },
                      color: { type: "string" },
                      year: { type: "number" },
                      category: { type: "string" },
                      createdAt: { type: "string" },
                      updatedAt: { type: "string" }
                    }
                  },
                  client: {
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
        }
      }
    },
    (request, reply) => vehiclesController.getByPlate(request, reply)
  );

  app.put(
    "/vehicles/:plate",
    {
      schema: {
        tags: ["Veículos"],
        summary: "Atualizar veículo",
        description: "Atualiza informações do veículo.",
        params: {
          type: "object",
          required: ["plate"],
          properties: {
            plate: { type: "string", example: "BRA2E19" }
          }
        },
        body: {
          type: "object",
          properties: {
            clientId: { type: "number", example: 1 },
            brand: { type: "string", enum: [...KNOWN_VEHICLE_BRANDS], example: "Honda" },
            model: { type: "string", example: "Civic G10" },
            color: { type: "string", enum: [...KNOWN_VEHICLE_COLORS], example: "Branco" },
            year: { type: "number", example: 2022 },
            category: { type: "string", enum: ["HATCH", "SEDAN", "SUV", "PICKUP"], example: "SEDAN" }
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
                  plate: { type: "string" },
                  formattedPlate: { type: "string" },
                  clientId: { type: "number" },
                  brand: { type: "string" },
                  model: { type: "string" },
                  color: { type: "string" },
                  year: { type: "number" },
                  category: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => vehiclesController.update(request, reply)
  );

  app.delete(
    "/vehicles/:plate",
    {
      schema: {
        tags: ["Veículos"],
        summary: "Remover veículo",
        description: "Remove o veículo do sistema.",
        params: {
          type: "object",
          required: ["plate"],
          properties: {
            plate: { type: "string", example: "BRA2E19" }
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
    (request, reply) => vehiclesController.delete(request, reply)
  );
}
