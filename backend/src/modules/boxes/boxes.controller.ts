import { FastifyReply, FastifyRequest } from "fastify";
import { BoxesService } from "./boxes.service.js";
import {
  createBoxBodySchema,
  updateBoxBodySchema,
  updateBoxStatusBodySchema,
  boxIdParamSchema,
  listBoxesQuerySchema
} from "./boxes.schema.js";

export class BoxesController {
  constructor(private readonly boxesService: BoxesService) { }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = createBoxBodySchema.parse(request.body);
    const box = await this.boxesService.createBox(parsedBody);

    return reply
      .header("Location", `/v1/boxes/${box.id}`)
      .status(201)
      .send({
        statusCode: 201,
        message: "Box cadastrado com sucesso",
        data: box
      });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = boxIdParamSchema.parse(request.params);
    const box = await this.boxesService.getBoxById(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Box localizado com sucesso",
      data: box
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listBoxesQuerySchema.parse(request.query);
    const result = await this.boxesService.listBoxes(query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Lista de boxes recuperada com sucesso",
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
    const { id } = boxIdParamSchema.parse(request.params);
    const parsedBody = updateBoxBodySchema.parse(request.body);
    const updated = await this.boxesService.updateBox(id, parsedBody);

    return reply.status(200).send({
      statusCode: 200,
      message: "Box atualizado com sucesso",
      data: updated
    });
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = boxIdParamSchema.parse(request.params);
    const { status } = updateBoxStatusBodySchema.parse(request.body);
    const updated = await this.boxesService.updateBoxStatus(id, status);

    return reply.status(200).send({
      statusCode: 200,
      message: "Status do box atualizado com sucesso",
      data: updated
    });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = boxIdParamSchema.parse(request.params);
    await this.boxesService.deleteBox(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Box removido com sucesso"
    });
  }
}
