import { FastifyReply, FastifyRequest } from "fastify";
import { VehiclesService } from "./vehicles.service.js";
import { createVehicleBodySchema, plateParamSchema } from "./vehicles.schema.js";

export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = createVehicleBodySchema.parse(request.body);
    const vehicle = await this.vehiclesService.createVehicle(parsedBody);

    return reply.status(201).send({
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
}
