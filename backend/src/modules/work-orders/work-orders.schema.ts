import { z } from "zod";
import { workOrderStatusEnum } from "../../db/schema/enums/work-order-status.js";

export const createWorkOrderBodySchema = z.object({
  clientId: z.coerce
    .number({ required_error: "ID do cliente é obrigatório" })
    .int()
    .positive("ID do cliente deve ser um número inteiro positivo"),
  vehiclePlate: z
    .string({ required_error: "Placa do veículo é obrigatória" })
    .trim()
    .min(7, "Placa deve conter no mínimo 7 caracteres")
    .max(10, "Placa não pode exceder 10 caracteres"),
  boxId: z.coerce
    .number({ required_error: "ID do box é obrigatório" })
    .int()
    .positive("ID do box deve ser um número inteiro positivo"),
  appointmentId: z.coerce
    .number()
    .int()
    .positive("ID do agendamento deve ser um número inteiro positivo")
    .optional(),
  serviceIds: z
    .array(
      z.coerce
        .number()
        .int()
        .positive("ID do serviço deve ser um número inteiro positivo")
    )
    .min(1, "Informe ao menos um serviço para abertura da Ordem de Serviço"),
  notes: z.string().trim().max(500, "Observações não podem exceder 500 caracteres").optional()
});

export const addWorkOrderItemBodySchema = z.object({
  serviceId: z.coerce
    .number({ required_error: "ID do serviço é obrigatório" })
    .int()
    .positive("ID do serviço deve ser um número inteiro positivo"),
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantidade deve ser no mínimo 1")
    .default(1)
});

export const updateWorkOrderStatusSchema = z
  .object({
    status: z.enum(workOrderStatusEnum.enumValues, {
      errorMap: () => ({
        message:
          "Status inválido. Valores permitidos: CHECK_IN, IN_PROGRESS, FINISHING, READY_FOR_PICKUP, DELIVERED, CANCELLED"
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
    { message: "Motivo do cancelamento é obrigatório ao cancelar a Ordem de Serviço" }
  );

export const listWorkOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(workOrderStatusEnum.enumValues).optional(),
  boxId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  vehiclePlate: z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const workOrderIdParamSchema = z.object({
  id: z.coerce
    .number({ required_error: "ID da Ordem de Serviço é obrigatório" })
    .int()
    .positive("ID da Ordem de Serviço deve ser um número inteiro positivo")
});

export const workOrderItemIdParamSchema = z.object({
  id: z.coerce
    .number({ required_error: "ID da Ordem de Serviço é obrigatório" })
    .int()
    .positive("ID da Ordem de Serviço deve ser um número inteiro positivo"),
  itemId: z.coerce
    .number({ required_error: "ID do item é obrigatório" })
    .int()
    .positive("ID do item deve ser um número inteiro positivo")
});

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderBodySchema>;
export type AddWorkOrderItemInput = z.infer<typeof addWorkOrderItemBodySchema>;
export type UpdateWorkOrderStatusInput = z.infer<typeof updateWorkOrderStatusSchema>;
export type ListWorkOrdersQuery = z.infer<typeof listWorkOrdersQuerySchema>;
export type WorkOrderIdParam = z.infer<typeof workOrderIdParamSchema>;
export type WorkOrderItemIdParam = z.infer<typeof workOrderItemIdParamSchema>;
