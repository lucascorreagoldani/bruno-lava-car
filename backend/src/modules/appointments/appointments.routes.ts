import { FastifyInstance } from "fastify";
import { db } from "../../db/connection.js";
import { DrizzleAppointmentsRepository } from "./appointments.repository.js";
import { DrizzleClientsRepository } from "../clients/clients.repository.js";
import { DrizzleVehiclesRepository } from "../vehicles/vehicles.repository.js";
import { DrizzleServicesRepository } from "../services/services.repository.js";
import { DrizzleBoxesRepository } from "../boxes/boxes.repository.js";
import { AppointmentsService } from "./appointments.service.js";
import { AppointmentsController } from "./appointments.controller.js";
import { distributedLock } from "../../shared/redis/distributed-lock.js";

export async function appointmentsRoutes(app: FastifyInstance) {
  const appointmentsRepository = new DrizzleAppointmentsRepository(db);
  const clientsRepository = new DrizzleClientsRepository(db);
  const vehiclesRepository = new DrizzleVehiclesRepository(db);
  const servicesRepository = new DrizzleServicesRepository(db);
  const boxesRepository = new DrizzleBoxesRepository(db);

  const appointmentsService = new AppointmentsService(
    appointmentsRepository,
    clientsRepository,
    vehiclesRepository,
    servicesRepository,
    boxesRepository,
    distributedLock
  );

  const appointmentsController = new AppointmentsController(appointmentsService);

  app.post(
    "/appointments",
    {
      schema: {
        tags: ["Agendamentos"],
        summary: "Criar novo agendamento",
        description:
          "Registra um novo agendamento com controle de concorrência no Redis, congelamento de preço por categoria e validação de sobreposição de horário no box.",
        body: {
          type: "object",
          required: ["clientId", "vehiclePlate", "serviceId", "boxId", "scheduledAt"],
          properties: {
            clientId: { type: "number", example: 1 },
            vehiclePlate: { type: "string", example: "BRA2E19" },
            serviceId: { type: "number", example: 1 },
            boxId: { type: "number", example: 1 },
            scheduledAt: { type: "string", example: "2026-10-15T14:00:00.000Z" },
            notes: { type: "string", example: "Cliente prefere secagem minuciosa nas portas." }
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
                  clientId: { type: "number" },
                  vehiclePlate: { type: "string" },
                  serviceId: { type: "number" },
                  boxId: { type: "number" },
                  scheduledAt: { type: "string" },
                  estimatedEndAt: { type: "string" },
                  priceInCents: { type: "number" },
                  formattedPrice: { type: "string" },
                  status: { type: "string" },
                  notes: { type: "string" },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
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
                  service: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      durationMinutes: { type: "number" }
                    }
                  },
                  box: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      name: { type: "string" },
                      status: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => appointmentsController.create(request, reply)
  );

  app.get(
    "/appointments",
    {
      schema: {
        tags: ["Agendamentos"],
        summary: "Listar agendamentos",
        description:
          "Retorna a lista paginada de agendamentos com filtros por status, box, cliente, veículo e período.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1, minimum: 1 },
            limit: { type: "number", default: 20, minimum: 1, maximum: 100 },
            status: {
              type: "string",
              enum: ["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"]
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
                    clientId: { type: "number" },
                    vehiclePlate: { type: "string" },
                    serviceId: { type: "number" },
                    boxId: { type: "number" },
                    scheduledAt: { type: "string" },
                    estimatedEndAt: { type: "string" },
                    priceInCents: { type: "number" },
                    formattedPrice: { type: "string" },
                    status: { type: "string" },
                    notes: { type: "string" },
                    cancellationReason: { type: "string" },
                    completedAt: { type: "string" }
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
    (request, reply) => appointmentsController.list(request, reply)
  );

  app.get(
    "/appointments/:id",
    {
      schema: {
        tags: ["Agendamentos"],
        summary: "Buscar agendamento por ID",
        description: "Retorna as informações completas do agendamento com dados das entidades vinculadas.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        }
      }
    },
    (request, reply) => appointmentsController.getById(request, reply)
  );

  app.get(
    "/appointments/:id/history",
    {
      schema: {
        tags: ["Agendamentos"],
        summary: "Linha do tempo e histórico do agendamento",
        description: "Retorna a trilha de auditoria completa com cada transição de status e ação realizada.",
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
                    appointmentId: { type: "number" },
                    previousStatus: { type: "string" },
                    newStatus: { type: "string" },
                    action: { type: "string" },
                    reason: { type: "string" },
                    notes: { type: "string" },
                    metadata: { type: "object" },
                    createdAt: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    },
    (request, reply) => appointmentsController.getHistory(request, reply)
  );

  app.patch(
    "/appointments/:id/status",
    {
      schema: {
        tags: ["Agendamentos"],
        summary: "Alterar status do agendamento",
        description:
          "Atualiza o status operacional (CONFIRMED, CANCELLED, COMPLETED) com gravação na linha do tempo.",
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
              enum: ["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"],
              example: "CONFIRMED"
            },
            cancellationReason: {
              type: "string",
              example: "Cliente informou imprevisto de viagem."
            },
            notes: {
              type: "string",
              example: "Confirmado via WhatsApp."
            }
          }
        }
      }
    },
    (request, reply) => appointmentsController.updateStatus(request, reply)
  );

  app.patch(
    "/appointments/:id/reschedule",
    {
      schema: {
        tags: ["Agendamentos"],
        summary: "Reagendar atendimento",
        description:
          "Altera data/hora ou baia do agendamento, protegida por lock no Redis e validação de sobreposição.",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "number" }
          }
        },
        body: {
          type: "object",
          required: ["scheduledAt"],
          properties: {
            scheduledAt: { type: "string", example: "2026-10-16T10:00:00.000Z" },
            boxId: { type: "number", example: 2 },
            reason: { type: "string", example: "Solicitação do cliente para adiar 1 dia." },
            notes: { type: "string" }
          }
        }
      }
    },
    (request, reply) => appointmentsController.reschedule(request, reply)
  );

  app.get(
    "/clients/:id/appointments",
    {
      schema: {
        tags: ["Clientes", "Agendamentos"],
        summary: "Histórico de agendamentos do cliente",
        description: "Consulta o histórico cronológico de todos os atendimentos solicitados por um cliente.",
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
    (request, reply) => appointmentsController.listByClient(request, reply)
  );

  app.get(
    "/vehicles/:plate/appointments",
    {
      schema: {
        tags: ["Veículos", "Agendamentos"],
        summary: "Prontuário de atendimentos do veículo",
        description: "Consulta o prontuário histórico com todos os serviços já executados no veículo.",
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
    (request, reply) => appointmentsController.listByVehicle(request, reply)
  );
}
