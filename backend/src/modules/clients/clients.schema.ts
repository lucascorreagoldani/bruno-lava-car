import { z } from "zod";

export const createClientBodySchema = z.object({
  fullName: z
    .string({ required_error: "Nome completo é obrigatório" })
    .min(2, "Nome deve conter no mínimo 2 caracteres")
    .max(150, "Nome não pode exceder 150 caracteres"),
  phone: z
    .string({ required_error: "Telefone é obrigatório" })
    .min(7, "Telefone deve conter no mínimo 7 caracteres")
    .max(30, "Telefone não pode exceder 30 caracteres")
});

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional()
});

export const clientIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID do cliente deve ser um número inteiro positivo")
});

export type CreateClientInput = z.infer<typeof createClientBodySchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type ClientIdParam = z.infer<typeof clientIdParamSchema>;
