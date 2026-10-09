import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3333),
  API_BASE_URL: z.string().url("API_BASE_URL deve ser uma URL válida"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória e deve ser configurada no .env"),
  REDIS_URL: z.string().min(1, "REDIS_URL é obrigatória e deve ser configurada no .env"),
  WHATSAPP_DRIVER: z.enum(["mock", "webhook", "evolution"]).default("mock"),
  WHATSAPP_API_URL: z.string().url("WHATSAPP_API_URL deve ser uma URL válida").optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  PIX_KEY: z.string().min(1, "PIX_KEY é obrigatória").default("contato@brunolavacar.com.br")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
  throw new Error(`Falha de configuração das variáveis de ambiente: ${issues}`);
}

export const env = parsedEnv.data;
