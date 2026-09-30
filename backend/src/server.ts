import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function startServer() {
  const app = buildApp();

  try {
    const address = await app.listen({
      port: env.PORT,
      host: "0.0.0.0"
    });

    app.log.info(`Servidor executando em: ${address}`);
    app.log.info(`Documentação disponível em: ${address}/documentation`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const gracefulShutdown = async (signal: string) => {
    app.log.info(`Sinal ${signal} recebido. Encerrando servidor.`);
    try {
      await app.close();
      app.log.info("Servidor encerrado.");
      process.exit(0);
    } catch (err) {
      app.log.error(`Erro ao encerrar servidor: ${err}`);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

startServer();
