import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://lavacar_admin:lavacar_dev_password@localhost:5432/bruno_lava_car?schema=public"
  },
  verbose: true,
  strict: true
});
