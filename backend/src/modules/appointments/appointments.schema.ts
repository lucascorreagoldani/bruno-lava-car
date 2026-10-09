import { z } from "zod";
import { appointmentStatusEnum } from "../../db/schema/enums/appointment-status.js";

export const createAppointmentBodySchema = z.object({
  clientId: z.coerce
    .number({ required_error: "ID do cliente é obrigatório" })
    .int()
    .positive("ID do cliente deve ser um número inteiro positivo"),
  vehiclePlate: z
    .string({ required_error: "Placa do veículo é obrigatória" })
    .trim()
    .min(7, "Placa deve conter no mínimo 7 caracteres")
    .max(10, "Placa não pode exceder 10 caracteres"),
  serviceId: z.coerce
    .number({ required_error: "ID do serviço é obrigatório" })
    .int()
    .positive("ID do serviço deve ser um número inteiro positivo"),
  boxId: z.coerce
    .number({ required_error: "ID do box é obrigatório" })
    .int()
    .positive("ID do box deve ser um número inteiro positivo"),
  scheduledAt: z
    .string({ required_error: "Data e hora de agendamento são obrigatórias" })
    .datetime({ message: "scheduledAt deve estar no formato ISO-8601" })
    .refine(
      (val) => new Date(val).getTime() > Date.now(),
      { message: "A data e hora do agendamento deve ser no futuro" }
    ),
  notes: z.string().trim().max(500, "Observações não podem exceder 500 caracteres").optional()
});

export const updateAppointmentStatusSchema = z
  .object({
    status: z.enum(appointmentStatusEnum.enumValues, {
      errorMap: () => ({
        message: "Status inválido. Valores permitidos: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED"
      })
    }),
    cancellationReason: z
      .string()
      .trim()
      .min(3, "Motivo do cancelamento deve conter no mínimo 3 caracteres")
      .max(300, "Motivo do cancelamento não pode exceder 300 caracteres")
      .optional(),
    notes: z.string().trim().max(500, "Observações não podem exceder 500 caracteres").optional()
  })
  .refine(
    (data) => {
      if (data.status === "CANCELLED") {
        return Boolean(data.cancellationReason && data.cancellationReason.length >= 3);
      }
      return true;
    },
    { message: "Motivo do cancelamento é obrigatório ao cancelar o agendamento" }
  );

export const rescheduleAppointmentBodySchema = z.object({
  scheduledAt: z
    .string({ required_error: "Nova data e hora de agendamento são obrigatórias" })
    .datetime({ message: "scheduledAt deve estar no formato ISO-8601" })
    .refine(
      (val) => new Date(val).getTime() > Date.now(),
      { message: "A nova data e hora do agendamento deve ser no futuro" }
    ),
  boxId: z.coerce
    .number()
    .int()
    .positive("ID do box deve ser um número inteiro positivo")
    .optional(),
  reason: z.string().trim().max(300, "Motivo não pode exceder 300 caracteres").optional(),
  notes: z.string().trim().max(500, "Observações não podem exceder 500 caracteres").optional()
});

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(appointmentStatusEnum.enumValues).optional(),
  boxId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  vehiclePlate: z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const appointmentIdParamSchema = z.object({
  id: z.coerce
    .number({ required_error: "ID do agendamento é obrigatório" })
    .int()
    .positive("ID do agendamento deve ser um número inteiro positivo")
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentBodySchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentBodySchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
export type AppointmentIdParam = z.infer<typeof appointmentIdParamSchema>;
