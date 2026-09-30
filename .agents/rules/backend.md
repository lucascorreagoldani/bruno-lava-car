# Regras de Engenharia Backend

- Framework HTTP: Fastify com tipagem estrita e logger Pino.
- Validação: Toda entrada e saída HTTP deve ser validada por schemas Zod.
- Camada de Dados: PostgreSQL utilizando Drizzle ORM ou Prisma, com pooling configurado.
- Concorrência e Bloqueios:
  - Agendamentos e reserva de boxes devem obrigatoriamente adquirir lock distribuído no Redis via ioredis antes de persistir no banco de dados.
- Filas e Tarefas em Background: Utilizar BullMQ para envio de notificações WhatsApp, webhooks e relatórios pesados.
- Tratamento de Erros:
  - Proibido engolir erros em blocos `catch` vazios.
  - As respostas de erro devem seguir o padrão: `{ statusCode, error, message, details }`.
