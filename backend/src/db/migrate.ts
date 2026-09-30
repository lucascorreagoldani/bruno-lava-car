import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

async function runMigrations() {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1
  });

  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    process.stdout.write("Migrations aplicadas com sucesso no banco de dados!\n");
  } catch (error) {
    process.stderr.write(`Falha ao executar migrations: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
