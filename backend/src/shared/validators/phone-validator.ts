import { z } from "zod";

const VALID_BRAZILIAN_DDDS = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99"
]);

export function sanitizeAndValidatePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");

  let fullDigits = digits;
  if (digits.length === 11) {
    fullDigits = `55${digits}`;
  }

  if (fullDigits.length !== 13) {
    throw new Error("Telefone inválido. O formato deve conter DDD e 9 dígitos (ex: 55996558820 ou (+55) 55 9 9655-8820).");
  }

  if (!fullDigits.startsWith("55")) {
    throw new Error("Apenas números de telefone do Brasil (+55) são aceitos atualmente.");
  }

  const ddd = fullDigits.slice(2, 4);
  if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
    throw new Error(`DDD ${ddd} informado não é um DDD válido no Brasil.`);
  }

  const mobileDigit = fullDigits.charAt(4);
  if (mobileDigit !== "9") {
    throw new Error("O número de celular deve obrigatoriamente iniciar com o dígito 9.");
  }

  return `+${fullDigits}`;
}

export function formatPhoneForDisplay(canonicalPhone: string): string {
  const digits = canonicalPhone.replace(/\D/g, "");
  if (digits.length !== 13) {
    return canonicalPhone;
  }

  const ddi = digits.slice(0, 2);
  const ddd = digits.slice(2, 4);
  const ninthDigit = digits.slice(4, 5);
  const part1 = digits.slice(5, 9);
  const part2 = digits.slice(9, 13);

  return `(+${ddi}) ${ddd} ${ninthDigit} ${part1}-${part2}`;
}

export const phoneSchema = z
  .string({ required_error: "Telefone é obrigatório" })
  .min(10, "Telefone muito curto")
  .max(25, "Telefone muito longo")
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
