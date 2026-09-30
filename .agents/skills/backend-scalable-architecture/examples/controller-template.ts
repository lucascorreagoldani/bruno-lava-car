import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  customerId: z.string().uuid("ID de cliente inválido"),
  vehiclePlate: z.string().min(7, "Placa deve ter no mínimo 7 caracteres").max(8),
  serviceIds: z.array(z.string().uuid()).min(1, "Selecione ao menos um serviço"),
  scheduledAt: z.string().datetime("Formato de data e hora ISO 8601 obrigatório"),
  boxId: z.string().uuid("ID do box de lavagem obrigatório")
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export interface AppointmentServiceContract {
  scheduleAppointment(input: CreateAppointmentInput): Promise<{
    id: string;
    scheduledAt: string;
    totalPrice: number;
    status: string;
  }>;
}

export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentServiceContract) { }

  async handleCreate(request: FastifyRequest, reply: FastifyReply) {
    const parsedBody = CreateAppointmentSchema.parse(request.body);
    const appointment = await this.appointmentService.scheduleAppointment(parsedBody);

    return reply.status(201).send({
      statusCode: 201,
      message: "Agendamento reservado com sucesso",
      data: appointment
    });
  }
}
