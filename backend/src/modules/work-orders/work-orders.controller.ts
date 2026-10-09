import { FastifyReply, FastifyRequest } from "fastify";
import { WorkOrdersService } from "./work-orders.service.js";
import {
  createWorkOrderBodySchema,
  addWorkOrderItemBodySchema,
  updateWorkOrderStatusSchema,
  listWorkOrdersQuerySchema,
  workOrderIdParamSchema,
  workOrderItemIdParamSchema
} from "./work-orders.schema.js";
import { clientIdParamSchema } from "../clients/clients.schema.js";
import { plateParamSchema } from "../vehicles/vehicles.schema.js";
import { paginationQuerySchema } from "../../shared/schemas/pagination.js";

export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) { }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = createWorkOrderBodySchema.parse(request.body);
    const created = await this.workOrdersService.createWorkOrder({
      clientId: parsedBody.clientId,
      vehiclePlate: parsedBody.vehiclePlate,
      boxId: parsedBody.boxId,
      appointmentId: parsedBody.appointmentId,
      serviceIds: parsedBody.serviceIds,
      notes: parsedBody.notes
    });

    return reply
      .header("Location", `/v1/work-orders/${created.id}`)
      .status(201)
      .send({
        statusCode: 201,
        message: "Ordem de Serviço aberta com sucesso",
        data: created
      });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdParamSchema.parse(request.params);
    const workOrder = await this.workOrdersService.getWorkOrderById(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Ordem de Serviço localizada com sucesso",
      data: workOrder
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listWorkOrdersQuerySchema.parse(request.query);
    const result = await this.workOrdersService.listWorkOrders({
      page: query.page,
      limit: query.limit,
      status: query.status,
      boxId: query.boxId,
      clientId: query.clientId,
      vehiclePlate: query.vehiclePlate,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined
    });

    return reply.status(200).send({
      statusCode: 200,
      message: "Lista de Ordens de Serviço recuperada com sucesso",
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdParamSchema.parse(request.params);
    const parsedBody = updateWorkOrderStatusSchema.parse(request.body);
    const updated = await this.workOrdersService.updateWorkOrderStatus(id, parsedBody);

    return reply.status(200).send({
      statusCode: 200,
      message: `Status da Ordem de Serviço alterado para ${updated.status} com sucesso`,
      data: updated
    });
  }

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdParamSchema.parse(request.params);
    const parsedBody = addWorkOrderItemBodySchema.parse(request.body);
    const updated = await this.workOrdersService.addWorkOrderItem(id, parsedBody);

    return reply.status(200).send({
      statusCode: 200,
      message: "Serviço adicional adicionado à Ordem de Serviço com sucesso",
      data: updated
    });
  }

  async removeItem(request: FastifyRequest, reply: FastifyReply) {
    const { id, itemId } = workOrderItemIdParamSchema.parse(request.params);
    const updated = await this.workOrdersService.removeWorkOrderItem(id, itemId);

    return reply.status(200).send({
      statusCode: 200,
      message: "Item removido da Ordem de Serviço com sucesso",
      data: updated
    });
  }

  async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdParamSchema.parse(request.params);
    const history = await this.workOrdersService.getWorkOrderHistory(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Linha do tempo e histórico da Ordem de Serviço recuperados com sucesso",
      data: history
    });
  }

  async listByClient(request: FastifyRequest, reply: FastifyReply) {
    const { id } = clientIdParamSchema.parse(request.params);
    const query = paginationQuerySchema.parse(request.query);
    const result = await this.workOrdersService.listClientWorkOrders(id, query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Histórico de Ordens de Serviço do cliente recuperado com sucesso",
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  }

  async listByVehicle(request: FastifyRequest, reply: FastifyReply) {
    const { plate } = plateParamSchema.parse(request.params);
    const query = paginationQuerySchema.parse(request.query);
    const result = await this.workOrdersService.listVehicleWorkOrders(plate, query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Prontuário de Ordens de Serviço do veículo recuperado com sucesso",
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  }
}
