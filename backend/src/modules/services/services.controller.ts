import { FastifyReply, FastifyRequest } from "fastify";
import { ServicesService } from "./services.service.js";
import {
  createServiceBodySchema,
  updateServiceBodySchema,
  serviceIdParamSchema,
  listServicesQuerySchema,
  calculatePriceQuerySchema
} from "./services.schema.js";

export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = createServiceBodySchema.parse(request.body);
    const service = await this.servicesService.createService(parsedBody);

    return reply
      .header("Location", `/v1/services/${service.id}`)
      .status(201)
      .send({
        statusCode: 201,
        message: "Serviço cadastrado com sucesso",
        data: service
      });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = serviceIdParamSchema.parse(request.params);
    const service = await this.servicesService.getServiceById(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Serviço localizado com sucesso",
      data: service
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listServicesQuerySchema.parse(request.query);
    const result = await this.servicesService.listServices(query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Lista de serviços recuperada com sucesso",
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = serviceIdParamSchema.parse(request.params);
    const parsedBody = updateServiceBodySchema.parse(request.body);
    const updated = await this.servicesService.updateService(id, parsedBody);

    return reply.status(200).send({
      statusCode: 200,
      message: "Serviço atualizado com sucesso",
      data: updated
    });
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    const { id } = serviceIdParamSchema.parse(request.params);
    const updated = await this.servicesService.toggleActive(id);

    return reply.status(200).send({
      statusCode: 200,
      message: `Serviço ${updated.active ? "ativado" : "desativado"} com sucesso`,
      data: updated
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = serviceIdParamSchema.parse(request.params);
    await this.servicesService.deleteService(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Serviço removido com sucesso"
    });
  }

  async calculatePrice(request: FastifyRequest, reply: FastifyReply) {
    const { id } = serviceIdParamSchema.parse(request.params);
    const { category } = calculatePriceQuerySchema.parse(request.query);
    const calculated = await this.servicesService.calculatePriceForCategory(id, category);

    return reply.status(200).send({
      statusCode: 200,
      message: "Preço do serviço consultado com sucesso",
      data: calculated
    });
  }
}
