import { z } from "zod";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

export function sanitizeAndValidatePhone(rawPhone: string, defaultCountry: CountryCode = "BR"): string {
  const trimmed = rawPhone.trim();

  if (!trimmed) {
    throw new Error("Número de telefone não pode ser vazio.");
  }

  const phoneNumber = parsePhoneNumberFromString(trimmed, defaultCountry);

  if (!phoneNumber) {
    throw new Error("Telefone inválido. Informe um número no padrão internacional (+55 55 99655-8820) ou com DDD nacional.");
  }

  if (!phoneNumber.isValid()) {
    throw new Error(`Número de telefone não é válido para o país ${phoneNumber.country || "informado"}.`);
  }

  return phoneNumber.number;
}

export function formatPhoneForDisplay(canonicalPhone: string, mode: "international" | "national" = "international"): string {
  const phoneNumber = parsePhoneNumberFromString(canonicalPhone);
  if (!phoneNumber) {
    return canonicalPhone;
  }

  if (mode === "national") {
    return phoneNumber.formatNational();
  }

  return phoneNumber.formatInternational();
}

export const phoneSchema = z
  .string({ required_error: "Telefone é obrigatório" })
  .min(7, "Telefone muito curto")
  .max(30, "Telefone muito longo")
  .transform((val, ctx) => {
    try {
      return sanitizeAndValidatePhone(val);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err instanceof Error ? err.message : "Telefone inválido"
      });
      return z.NEVER;
    }
  });
