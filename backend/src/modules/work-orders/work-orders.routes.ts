import { FastifyInstance } from "fastify";
import { db } from "../../db/connection.js";
import { DrizzleWorkOrdersRepository } from "./work-orders.repository.js";
import { DrizzleClientsRepository } from "../clients/clients.repository.js";
import { DrizzleVehiclesRepository } from "../vehicles/vehicles.repository.js";
import { DrizzleServicesRepository } from "../services/services.repository.js";
import { DrizzleBoxesRepository } from "../boxes/boxes.repository.js";
import { DrizzleAppointmentsRepository } from "../appointments/appointments.repository.js";
import { WorkOrdersService } from "./work-orders.service.js";
import { WorkOrdersController } from "./work-orders.controller.js";
import { NotificationsRepository } from "../notifications/notifications.repository.js";
import { NotificationsService } from "../notifications/notifications.service.js";

export async function workOrdersRoutes(app: FastifyInstance) {
  const workOrdersRepository = new DrizzleWorkOrdersRepository(db);
  const clientsRepository = new DrizzleClientsRepository(db);
  const vehiclesRepository = new DrizzleVehiclesRepository(db);
  const servicesRepository = new DrizzleServicesRepository(db);
  const boxesRepository = new DrizzleBoxesRepository(db);
  const appointmentsRepository = new DrizzleAppointmentsRepository(db);
  const notificationsRepository = new NotificationsRepository();
  const notificationsService = new NotificationsService(notificationsRepository);

  const workOrdersService = new WorkOrdersService(
    workOrdersRepository,
    clientsRepository,
    vehiclesRepository,
    servicesRepository,
    boxesRepository,
    appointmentsRepository,
    notificationsService
  );

  const workOrdersController = new WorkOrdersController(workOrdersService);

  app.post(
    "/work-orders",
    {
      schema: {
        tags: ["Ordens de Serviço"],
        summary: "Abrir nova Ordem de Serviço",
        description:
          "Registra a entrada do veículo no pátio e abertura de OS com múltiplos serviços, precificação congelada por categoria e auditoria.",
        body: {
          type: "object",
          required: ["clientId", "vehiclePlate", "boxId", "serviceIds"],
          properties: {
            clientId: { type: "number", example: 1 },
            vehiclePlate: { type: "string", example: "BRA2E19" },
            boxId: { type: "number", example: 1 },
            appointmentId: { type: "number", example: 1 },
            serviceIds: {
              type: "array",
              items: { type: "number" },
              example: [1]
            },
            notes: { type: "string", example: "Veículo deu entrada às 08h30." }
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
                  orderNumber: { type: "string" },
                  status: { type: "string" },
                  totalPriceInCents: { type: "number" },
                  formattedTotalPrice: { type: "string" },
                  checkInAt: { type: "string" },
                  client: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      fullName: { type: "string" },
                      phone: { type: "string" }
                    }
                  },
                  vehicle: {
                    type: "object",
                    properties: {
                      plate: { type: "string" },
                      brand: { type: "string" },
                      model: { type: "string" },
                      color: { type: "string" },
                      category: { type: "string" }
                    }
                  },
                  box: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" }
                    }
                  },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        serviceName: { type: "string" },
                        unitPriceInCents: { type: "number" },
                        formattedUnitPrice: { type: "string" },
                        quantity: { type: "number" },
                        totalPriceInCents: { type: "number" },
                        formattedTotalPrice: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => workOrdersController.create(request, reply)
  );

  app.get(
    "/work-orders",
    {
      schema: {
        tags: ["Ordens de Serviço"],
        summary: "Listar Ordens de Serviço",
        description:
          "Retorna a lista paginada de Ordens de Serviço com filtros por status, box, cliente, veículo e período.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1, minimum: 1 },
            limit: { type: "number", default: 20, minimum: 1, maximum: 100 },
            status: {
              type: "string",
              enum: [
                "CHECK_IN",
                "IN_PROGRESS",
                "FINISHING",
                "READY_FOR_PICKUP",
                "DELIVERED",
                "CANCELLED"
              ]
            },
            boxId: { type: "number" },
            clientId: { type: "number" },
            vehiclePlate: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" }
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
                    orderNumber: { type: "string" },
                    status: { type: "string" },
                    totalPriceInCents: { type: "number" },
                    formattedTotalPrice: { type: "string" },
                    checkInAt: { type: "string" },
                    startedAt: { type: "string" },
                    finishedAt: { type: "string" },
                    deliveredAt: { type: "string" }
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
    (request, reply) => workOrdersController.list(request, reply)
  );

  app.get(
    "/work-orders/:id",
    {
      schema: {
        tags: ["Ordens de Serviço"],
        summary: "Buscar Ordem de Serviço por ID",
        description:
          "Retorna as informações completas da OS com cliente, veículo, box, serviços e linha do tempo.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        }
      }
    },
    (request, reply) => workOrdersController.getById(request, reply)
  );

  app.patch(
    "/work-orders/:id/status",
    {
      schema: {
        tags: ["Ordens de Serviço"],
        summary: "Avançar ou alterar status da Ordem de Serviço",
        description:
          "Transita o atendimento entre as fases operacionais (IN_PROGRESS, FINISHING, READY_FOR_PICKUP, DELIVERED, CANCELLED).",
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
              enum: [
                "CHECK_IN",
                "IN_PROGRESS",
                "FINISHING",
                "READY_FOR_PICKUP",
                "DELIVERED",
                "CANCELLED"
              ],
              example: "IN_PROGRESS"
            },
            cancellationReason: {
              type: "string",
              example: "Cliente solicitou cancelamento por imprevisto."
            },
            notes: {
              type: "string",
              example: "Veículo posicionado no box e serviço iniciado."
            }
          }
        }
      }
    },
    (request, reply) => workOrdersController.updateStatus(request, reply)
  );

  app.post(
    "/work-orders/:id/items",
    {
      schema: {
        tags: ["Ordens de Serviço"],
        summary: "Adicionar serviço adicional à OS",
        description:
          "Acrescenta um novo serviço ao atendimento em andamento e recalcula o valor total automaticamente.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        },
        body: {
          type: "object",
          required: ["serviceId"],
          properties: {
            serviceId: { type: "number", example: 1 },
            quantity: { type: "number", default: 1, example: 1 }
          }
        }
      }
    },
    (request, reply) => workOrdersController.addItem(request, reply)
  );

  app.delete(
    "/work-orders/:id/items/:itemId",
    {
      schema: {
        tags: ["Ordens de Serviço"],
        summary: "Remover serviço da OS",
        description:
          "Remove um serviço da Ordem de Serviço e recalcula o valor total (a OS deve manter ao menos um serviço).",
        params: {
          type: "object",
          required: ["id", "itemId"],
          properties: {
            id: { type: "number" },
            itemId: { type: "number" }
          }
        }
      }
    },
    (request, reply) => workOrdersController.removeItem(request, reply)
  );

  app.get(
    "/work-orders/:id/history",
    {
      schema: {
        tags: ["Ordens de Serviço"],
        summary: "Linha do tempo e histórico da Ordem de Serviço",
        description: "Retorna a trilha de auditoria completa de cada evento e transição da OS.",
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
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    workOrderId: { type: "number" },
                    previousStatus: { type: "string" },
                    newStatus: { type: "string" },
                    action: { type: "string" },
                    reason: { type: "string" },
                    notes: { type: "string" },
                    createdAt: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => workOrdersController.getHistory(request, reply)
  );

  app.get(
    "/clients/:id/work-orders",
    {
      schema: {
        tags: ["Clientes", "Ordens de Serviço"],
        summary: "Histórico de Ordens de Serviço do cliente",
        description: "Consulta o histórico de todas as OSs abertas e executadas para o cliente.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        },
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1, minimum: 1 },
            limit: { type: "number", default: 20, minimum: 1, maximum: 100 }
          }
        }
      }
    },
    (request, reply) => workOrdersController.listByClient(request, reply)
  );

  app.get(
    "/vehicles/:plate/work-orders",
    {
      schema: {
        tags: ["Veículos", "Ordens de Serviço"],
        summary: "Prontuário de Ordens de Serviço do veículo",
        description: "Consulta o histórico e prontuário completo de todas as passagens do veículo pelo pátio.",
        params: {
          type: "object",
          required: ["plate"],
          properties: {
            plate: { type: "string", example: "BRA2E19" }
          }
        },
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1, minimum: 1 },
            limit: { type: "number", default: 20, minimum: 1, maximum: 100 }
          }
        }
      }
    },
    (request, reply) => workOrdersController.listByVehicle(request, reply)
  );
}
