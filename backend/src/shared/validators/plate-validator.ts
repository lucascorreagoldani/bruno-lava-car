import { z } from "zod";

const TRADITIONAL_PLATE_REGEX = /^[A-Z]{3}[0-9]{4}$/;
const MERCOSUL_CAR_REGEX = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
const MERCOSUL_MOTO_REGEX = /^[A-Z]{3}[0-9]{2}[A-Z][0-9]$/;

export function sanitizeAndValidatePlate(rawPlate: string): string {
  const cleanPlate = rawPlate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (cleanPlate.length !== 7) {
    throw new Error("Placa deve conter exatamente 7 caracteres alfanuméricos.");
  }

  const isTraditional = TRADITIONAL_PLATE_REGEX.test(cleanPlate);
  const isMercosulCar = MERCOSUL_CAR_REGEX.test(cleanPlate);
  const isMercosulMoto = MERCOSUL_MOTO_REGEX.test(cleanPlate);

  if (!isTraditional && !isMercosulCar && !isMercosulMoto) {
    throw new Error("Formato de placa inválido. Deve ser no padrão Mercosul (BRA2E19) ou Tradicional (ABC1234).");
  }

  return cleanPlate;
}

export function formatPlateForDisplay(cleanPlate: string): string {
  if (TRADITIONAL_PLATE_REGEX.test(cleanPlate)) {
    return `${cleanPlate.slice(0, 3)}-${cleanPlate.slice(3)}`;
  }
  return cleanPlate;
}

export const plateSchema = z
  .string({ required_error: "Placa é obrigatória" })
  .min(7, "Placa deve ter no mínimo 7 caracteres")
  .max(10, "Placa muito longa")
  .transform((val, ctx) => {
    try {
      return sanitizeAndValidatePlate(val);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : "Placa inválida"
      });
      return z.NEVER;
    }
  });
