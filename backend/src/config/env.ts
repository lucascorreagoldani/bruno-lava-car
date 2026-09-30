import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3333),
  API_BASE_URL: z.string().url("API_BASE_URL deve ser uma URL válida"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória e deve ser configurada no .env"),
  REDIS_URL: z.string().min(1, "REDIS_URL é obrigatória e deve ser configurada no .env")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
  throw new Error(`Falha de configuração das variáveis de ambiente: ${issues}`);
}

export const env = parsedEnv.data;
