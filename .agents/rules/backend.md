# Regras de Engenharia Backend

- **Framework HTTP**: Fastify com tipagem estrita e logger Pino.
- **Padrão RESTful e Versionamento**:
  - Todas as rotas de negócio devem ser prefixadas com `/v1` (ex.: `/v1/clients`, `/v1/boxes`).
  - URIs devem ser estritamente semânticas e baseadas em recursos (substantivos no plural), nunca em verbos procedurais RPC.
  - Endpoints de criação (`POST`) com sucesso devem responder com status `201 Created` e incluir o cabeçalho `Location` apontando para a URI canônica do recurso criado.
  - Todas as listagens de coleções devem implementar paginação canônica obrigatória (`page`, `limit`), com limite máximo de itens parametrizado (ex.: máximo 100).
- **Validação de Schemas**: Toda entrada (`body`, `query`, `params`) e saída HTTP deve ser validada por schemas Zod.
- **Camada de Dados**: PostgreSQL utilizando Drizzle ORM ou Prisma, com pooling configurado.
- **Concorrência e Bloqueios**:
  - Agendamentos e reserva de boxes devem obrigatoriamente adquirir lock distribuído no Redis via ioredis antes de persistir no banco de dados.
- **Filas e Tarefas em Background**: Utilizar BullMQ para envio de notificações WhatsApp, webhooks e relatórios pesados.
- **Tratamento de Erros e Respostas**:
  - Proibido engolir erros em blocos `catch` vazios.
  - Respostas de erro devem seguir estritamente o padrão **RFC 7807 / RFC 9457 (Problem Details for HTTP APIs)** com `Content-Type: application/problem+json` e campos `type`, `title`, `status`, `detail`, `instance` e `invalidParams`.
