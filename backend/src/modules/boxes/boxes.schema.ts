import { z } from "zod";
import { boxStatusEnum } from "../../db/schema/enums/box-status.js";

export const createBoxBodySchema = z.object({
  name: z
    .string({ required_error: "Nome do box é obrigatório" })
    .trim()
    .min(2, "Nome do box deve conter no mínimo 2 caracteres")
    .max(60, "Nome do box não pode exceder 60 caracteres"),
  status: z
    .enum(boxStatusEnum.enumValues, {
      errorMap: () => ({ message: "Status do box inválido. Valores permitidos: ACTIVE, MAINTENANCE, INACTIVE" })
    })
    .default("ACTIVE"),
  description: z.string().trim().optional()
});

export const updateBoxBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome do box deve conter no mínimo 2 caracteres")
      .max(60, "Nome do box não pode exceder 60 caracteres")
      .optional(),
    status: z
      .enum(boxStatusEnum.enumValues, {
        errorMap: () => ({ message: "Status do box inválido. Valores permitidos: ACTIVE, MAINTENANCE, INACTIVE" })
      })
      .optional(),
    description: z.string().trim().optional()
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Pelo menos um campo deve ser fornecido para atualização do box" }
  );

export const updateBoxStatusBodySchema = z.object({
  status: z.enum(boxStatusEnum.enumValues, {
    errorMap: () => ({ message: "Status do box inválido. Valores permitidos: ACTIVE, MAINTENANCE, INACTIVE" })
  })
});

export const boxIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID do box deve ser um número inteiro positivo")
});

export const listBoxesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(boxStatusEnum.enumValues).optional(),
  search: z.string().optional()
});

export type CreateBoxInput = z.infer<typeof createBoxBodySchema>;
export type UpdateBoxInput = z.infer<typeof updateBoxBodySchema>;
export type UpdateBoxStatusInput = z.infer<typeof updateBoxStatusBodySchema>;
export type BoxIdParam = z.infer<typeof boxIdParamSchema>;
export type ListBoxesQuery = z.infer<typeof listBoxesQuerySchema>;
