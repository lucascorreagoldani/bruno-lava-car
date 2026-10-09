import type { FastifyReply, FastifyRequest } from "fastify";
import type { NotificationsServiceContract } from "./notifications.contract.js";
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  sendCustomNotificationBodySchema
} from "./notifications.schema.js";

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsServiceContract) { }

  public list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = listNotificationsQuerySchema.parse(request.query);
    const result = await this.notificationsService.listNotifications(query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Lista de notificações recuperada com sucesso",
      data: result.data,
      pagination: result.pagination
    });
  };

  public getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = notificationIdParamSchema.parse(request.params);
    const result = await this.notificationsService.getNotificationById(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Notificação localizada com sucesso",
      data: result
    });
  };

  public retry = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = notificationIdParamSchema.parse(request.params);
    const result = await this.notificationsService.retryNotification(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Notificação reenfileirada com sucesso para reprocessamento",
      data: result
    });
  };

  public sendCustom = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = sendCustomNotificationBodySchema.parse(request.body);
    const result = await this.notificationsService.sendCustomNotification(body);

    return reply
      .status(201)
      .header("Location", `/v1/notifications/${result.id}`)
      .send({
        statusCode: 201,
        message: "Mensagem personalizada enfileirada com sucesso",
        data: result
      });
  };
}
