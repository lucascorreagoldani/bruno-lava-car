---
name: backend-scalable-architecture
description: >-
  Use this skill whenever designing, building, or refactoring backend services,
  APIs, Fastify routes, Zod schemas, PostgreSQL queries, Redis distributed locks, or background queues.
---

# Diretrizes de Engenharia de Backend Escalável

## 1. Stack Tecnológica de Alta Performance
- **Runtime e Framework**: Node.js com TypeScript estrito executado sobre Fastify com logger estruturado de alta vazão (Pino).
- **Validação de Schemas**: Zod para validação em tempo de execução de `body`, `query`, `params` e variáveis de ambiente.
- **Camada de Dados**: PostgreSQL com Drizzle ORM ou Prisma, operando com pool de conexões otimizado (`pgBouncer` ou pooling nativo parametrizado).
- **Cache, Filas e Concorrência**: Redis com `ioredis` para locks distribuídos (evitar *race conditions* de reservas e transações concorrentes) e `BullMQ` para processamento assíncrono em background (disparos de mensagens, webhooks externos e crons).

## 2. Padrões de Arquitetura e Estruturação de Código
- Organize o código em módulos independentes seguindo Clean Architecture adaptada ou Vertical Slice:
  - `modules/<nome-do-modulo>/`
    - `<modulo>.controller.ts`: manipulação estrita de transporte HTTP, parsing e respostas de status.
    - `<modulo>.service.ts`: regras de negócio puras, orquestração de domínio e chamadas atômicas.
    - `<modulo>.repository.ts`: abstração direta de queries e mutações no banco de dados.
    - `<modulo>.schema.ts`: contratos de entrada e saída tipados via Zod com inferência automática de tipos TypeScript.
- **Injeção de Dependências**: Funções de domínio nunca devem instanciar conexões diretamente; repositórios e clientes externos devem ser injetados ou desacoplados via interfaces.

## 3. Resiliência e Concorrência Crítica
- **Locks Distribuídos**: Qualquer operação de alocação de horário exclusivo ou reserva de recurso finito deve obter lock transacional no Redis com TTL curto antes de verificar a disponibilidade no banco.
- **Transações Atômicas**: Operações que tocam duas ou mais tabelas relacionais dependentes devem rodar sob transações atômicas com tratamento rigoroso de rollback.
- **Idempotência de Webhooks**: Todas as rotas que recebem webhooks (como WhatsApp e gateways de pagamento) devem validar chave de idempotência (`message_id` ou `event_id`) armazenada em cache por 24 horas antes de processar eventos duplicados.

## 4. Tratamento de Erros e Respostas Padronizadas (RFC 7807)
- Não utilize blocos vazios de captura de exceções.
- Centralize o tratamento de erros em um manipulador global (`setErrorHandler` no Fastify).
- Siga as diretrizes completas da skill `rest-api-design`.
- Todas as respostas de erro devem obedecer estritamente à especificação **RFC 7807 / RFC 9457 (Problem Details for HTTP APIs)** com `Content-Type: application/problem+json`:
```json
{
  "type": "https://api.brunolavacar.com/errors/bad-request",
  "title": "Requisição Inválida",
  "status": 400,
  "detail": "Mensagem clara e legível do erro ocorrido",
  "instance": "/v1/recurso",
  "invalidParams": []
}
```

## 5. Exemplos e Templates de Referência
- Exemplo de Controller e Schemas Zod: [controller-template.ts](./examples/controller-template.ts)
- Exemplo de Service com Lock Distribuído e Transação: [service-lock-template.ts](./examples/service-lock-template.ts)
