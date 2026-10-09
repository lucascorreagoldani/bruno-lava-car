import { FastifyReply, FastifyRequest } from "fastify";
import { AppointmentsService } from "./appointments.service.js";
import {
  createAppointmentBodySchema,
  updateAppointmentStatusSchema,
  rescheduleAppointmentBodySchema,
  listAppointmentsQuerySchema,
  appointmentIdParamSchema
} from "./appointments.schema.js";
import { clientIdParamSchema } from "../clients/clients.schema.js";
import { plateParamSchema } from "../vehicles/vehicles.schema.js";
import { paginationQuerySchema } from "../../shared/schemas/pagination.js";

export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = createAppointmentBodySchema.parse(request.body);
    const appointment = await this.appointmentsService.createAppointment({
      clientId: parsedBody.clientId,
      vehiclePlate: parsedBody.vehiclePlate,
      serviceId: parsedBody.serviceId,
      boxId: parsedBody.boxId,
      scheduledAt: new Date(parsedBody.scheduledAt),
      notes: parsedBody.notes
    });

    return reply
      .header("Location", `/v1/appointments/${appointment.id}`)
      .status(201)
      .send({
        statusCode: 201,
        message: "Agendamento realizado com sucesso",
        data: appointment
      });
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = appointmentIdParamSchema.parse(request.params);
    const appointment = await this.appointmentsService.getAppointmentById(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Agendamento localizado com sucesso",
      data: appointment
    });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listAppointmentsQuerySchema.parse(request.query);
    const result = await this.appointmentsService.listAppointments({
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
      message: "Lista de agendamentos recuperada com sucesso",
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
    const { id } = appointmentIdParamSchema.parse(request.params);
    const parsedBody = updateAppointmentStatusSchema.parse(request.body);
    const updated = await this.appointmentsService.updateAppointmentStatus(id, parsedBody);

    return reply.status(200).send({
      statusCode: 200,
      message: `Status do agendamento alterado para ${updated.status} com sucesso`,
      data: updated
    });
  }

  async reschedule(request: FastifyRequest, reply: FastifyReply) {
    const { id } = appointmentIdParamSchema.parse(request.params);
    const parsedBody = rescheduleAppointmentBodySchema.parse(request.body);
    const updated = await this.appointmentsService.rescheduleAppointment(id, {
      scheduledAt: new Date(parsedBody.scheduledAt),
      boxId: parsedBody.boxId,
      reason: parsedBody.reason,
      notes: parsedBody.notes
    });

    return reply.status(200).send({
      statusCode: 200,
      message: "Atendimento reagendado com sucesso",
      data: updated
    });
  }

  async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = appointmentIdParamSchema.parse(request.params);
    const history = await this.appointmentsService.getAppointmentHistory(id);

    return reply.status(200).send({
      statusCode: 200,
      message: "Linha do tempo e histórico do agendamento recuperados com sucesso",
      data: history
    });
  }

  async listByClient(request: FastifyRequest, reply: FastifyReply) {
    const { id } = clientIdParamSchema.parse(request.params);
    const query = paginationQuerySchema.parse(request.query);
    const result = await this.appointmentsService.listClientAppointments(id, query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Histórico de agendamentos do cliente recuperado com sucesso",
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
    const result = await this.appointmentsService.listVehicleAppointments(plate, query);

    return reply.status(200).send({
      statusCode: 200,
      message: "Prontuário de atendimentos do veículo recuperado com sucesso",
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
