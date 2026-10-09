import { FastifyReply, FastifyRequest } from "fastify";
import { ClientsService } from "./clients.service.js";
import {
  createClientBodySchema,
  updateClientBodySchema,
  listClientsQuerySchema,
  clientIdParamSchema
} from "./clients.schema.js";

export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = createClientBodySchema.parse(request.body);
    const client = await this.clientsService.createClient(parsedBody);

    return reply
      .header("Location", `/v1/clients/${client.id}`)
      .status(201)
      .send({
        statusCode: 201,
        message: "Cliente cadastrado com sucesso",
        data: client
      });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = clientIdParamSchema.parse(request.params);
    const client = await this.clientsService.getClientById(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Cliente localizado com sucesso",
      data: client
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listClientsQuerySchema.parse(request.query);
    const result = await this.clientsService.listClients(query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Lista de clientes recuperada com sucesso",
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  }

  async getVehicles(request: FastifyRequest, reply: FastifyReply) {
    const { id } = clientIdParamSchema.parse(request.params);
    const result = await this.clientsService.getClientVehicles(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Veículos do cliente localizados com sucesso",
      data: result
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = clientIdParamSchema.parse(request.params);
    const parsedBody = updateClientBodySchema.parse(request.body);
    const client = await this.clientsService.updateClient(id, parsedBody);

    return reply.status(200).send({
      statusCode: 200,
      message: "Cliente atualizado com sucesso",
      data: client
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = clientIdParamSchema.parse(request.params);
    await this.clientsService.deleteClient(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Cliente removido com sucesso"
    });
  }
}
