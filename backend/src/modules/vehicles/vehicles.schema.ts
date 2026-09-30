import { z } from "zod";
import { vehicleCategoryEnum } from "../../db/schema/enums/index.js";
import {
  KNOWN_VEHICLE_BRANDS,
  KNOWN_VEHICLE_COLORS,
  getModelsForBrand
} from "../../db/schema/enums/vehicle-catalog.js";

const currentYear = new Date().getFullYear();
const maxAllowedYear = currentYear + 1;

export const createVehicleBodySchema = z.object({
  plate: z
    .string({ required_error: "Placa é obrigatória" })
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(10, "Placa não pode exceder 10 caracteres"),
  clientId: z.coerce
    .number({ required_error: "ID do cliente proprietário é obrigatório" })
    .int()
    .positive("ID do cliente proprietário deve ser um número inteiro positivo"),
  brand: z
    .string({ required_error: "Marca é obrigatória" })
    .trim()
    .min(2, "Marca deve conter no mínimo 2 caracteres")
    .max(50, "Marca não pode exceder 50 caracteres"),
  model: z
    .string({ required_error: "Modelo é obrigatório" })
    .trim()
    .min(2, "Modelo deve conter no mínimo 2 caracteres")
    .max(80, "Modelo não pode exceder 80 caracteres"),
  color: z
    .string({ required_error: "Cor é obrigatória" })
    .trim()
    .min(2, "Cor deve conter no mínimo 2 caracteres")
    .max(30, "Cor não pode exceder 30 caracteres"),
  year: z.coerce
    .number()
    .int()
    .min(1950, "Ano deve ser maior que 1950")
    .max(maxAllowedYear, `Ano não pode exceder ${maxAllowedYear}`)
    .optional(),
  category: z.enum(vehicleCategoryEnum.enumValues, {
    errorMap: () => ({ message: "Deve escolher uma categoria válida" })
  })
});

export const plateParamSchema = z.object({
  plate: z
    .string({ required_error: "Placa é obrigatória" })
    .min(7, "Placa deve ter no mínimo 7 caracteres")
    .max(10, "Placa não pode exceder 10 caracteres")
});

export const catalogQuerySchema = z.object({
  brand: z.string().optional()
});

export type CreateVehicleInput = z.infer<typeof createVehicleBodySchema>;
export type PlateParam = z.infer<typeof plateParamSchema>;
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export { KNOWN_VEHICLE_BRANDS, KNOWN_VEHICLE_COLORS, getModelsForBrand };
