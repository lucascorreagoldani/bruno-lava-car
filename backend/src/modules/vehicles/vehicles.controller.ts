import { FastifyReply, FastifyRequest } from "fastify";
import { VehiclesService } from "./vehicles.service.js";
import {
  createVehicleBodySchema,
  updateVehicleBodySchema,
  listVehiclesQuerySchema,
  plateParamSchema
} from "./vehicles.schema.js";

export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = createVehicleBodySchema.parse(request.body);
    const vehicle = await this.vehiclesService.createVehicle(parsedBody);

    return reply
      .header("Location", `/v1/vehicles/${vehicle.plate}`)
      .status(201)
      .send({
        statusCode: 201,
        message: "Veículo cadastrado e vinculado ao cliente com sucesso",
        data: vehicle
      });
  }

  async getByPlate(request: FastifyRequest, reply: FastifyReply) {
    const { plate } = plateParamSchema.parse(request.params);
    const result = await this.vehiclesService.getVehicleByPlate(plate);

    return reply.status(200).send({
      statusCode: 200,
      message: "Veículo localizado com sucesso",
      data: result
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listVehiclesQuerySchema.parse(request.query);
    const result = await this.vehiclesService.listVehicles(query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Lista de veículos recuperada com sucesso",
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
    const { plate } = plateParamSchema.parse(request.params);
    const parsedBody = updateVehicleBodySchema.parse(request.body);
    const vehicle = await this.vehiclesService.updateVehicle(plate, parsedBody);

    return reply.status(200).send({
      statusCode: 200,
      message: "Veículo atualizado com sucesso",
      data: vehicle
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { plate } = plateParamSchema.parse(request.params);
    await this.vehiclesService.deleteVehicle(plate);

    return reply.status(200).send({
      statusCode: 200,
      message: "Veículo removido com sucesso"
    });
  }
}
