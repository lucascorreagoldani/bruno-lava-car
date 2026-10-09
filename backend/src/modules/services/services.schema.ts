import { z } from "zod";
import { vehicleCategoryEnum } from "../../db/schema/enums/vehicle-category.js";

export const servicePriceItemSchema = z.object({
  category: z.enum(vehicleCategoryEnum.enumValues, {
    errorMap: () => ({ message: "Categoria de veículo inválida" })
  }),
  priceInCents: z.coerce
    .number({ required_error: "Preço em centavos é obrigatório" })
    .int("Preço deve ser um valor inteiro")
    .positive("Preço deve ser maior que zero")
});

export const createServiceBodySchema = z.object({
  name: z
    .string({ required_error: "Nome do serviço é obrigatório" })
    .trim()
    .min(2, "Nome deve conter no mínimo 2 caracteres")
    .max(100, "Nome não pode exceder 100 caracteres"),
  description: z.string().trim().optional(),
  durationMinutes: z.coerce
    .number({ required_error: "Duração estimada em minutos é obrigatória" })
    .int("Duração deve ser um número inteiro")
    .min(5, "Duração mínima deve ser de 5 minutos")
    .max(720, "Duração máxima não pode exceder 720 minutos"),
  prices: z
    .array(servicePriceItemSchema)
    .min(1, "Informe ao menos um preço por categoria para o serviço")
    .refine(
      (items) => {
        const categories = items.map((item) => item.category);
        return new Set(categories).size === categories.length;
      },
      { message: "Não podem existir preços duplicados para a mesma categoria de veículo" }
    )
});

export const updateServiceBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve conter no mínimo 2 caracteres")
      .max(100, "Nome não pode exceder 100 caracteres")
      .optional(),
    description: z.string().trim().optional(),
    durationMinutes: z.coerce
      .number()
      .int("Duração deve ser um número inteiro")
      .min(5, "Duração mínima deve ser de 5 minutos")
      .max(720, "Duração máxima não pode exceder 720 minutos")
      .optional(),
    active: z.boolean().optional(),
    prices: z
      .array(servicePriceItemSchema)
      .min(1, "Se informada a lista de preços, ela deve conter ao menos uma categoria")
      .refine(
        (items) => {
          const categories = items.map((item) => item.category);
          return new Set(categories).size === categories.length;
        },
        { message: "Não podem existir preços duplicados para a mesma categoria de veículo" }
      )
      .optional()
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Pelo menos um campo deve ser fornecido para atualização do serviço" }
  );

export const serviceIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID do serviço deve ser um número inteiro positivo")
});

export const listServicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  active: z.coerce.boolean().optional(),
  search: z.string().optional()
});

export const calculatePriceQuerySchema = z.object({
  category: z.enum(vehicleCategoryEnum.enumValues, {
    errorMap: () => ({ message: "Categoria de veículo inválida para consulta de preço" })
  })
});

export type CreateServiceInput = z.infer<typeof createServiceBodySchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceBodySchema>;
export type ServiceIdParam = z.infer<typeof serviceIdParamSchema>;
export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
export type CalculatePriceQuery = z.infer<typeof calculatePriceQuerySchema>;
