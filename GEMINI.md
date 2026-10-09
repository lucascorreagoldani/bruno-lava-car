# Bruno Lava Car - Configuração de Agentes e Instruções do Projeto

Este arquivo define as regras e o ecossistema de agentes para o projeto **Bruno Lava Car**.

---

## Regras Obrigatórias de Workflow e Qualidade
1. **Entrega de Código 100% Funcional**:
   - Sempre forneça arquivos e snippets completos com imports, tipagens e exports.
   - Proibido o uso de marcadores como `... resto do código ...`.
   - Evite comentários de linha dupla `//` no corpo do código; priorize código limpo e autoexplicativo com tipagem rigorosa.

2. **Diretrizes Específicas do Projeto**:
   - **Sem Commits Automáticos**: Não realize commits ou pushes automáticos via git. O assistente não deve commitar sem aprovação expressa do usuário.
   - **Versões Mais Recentes**: Sempre utilizar tudo na melhor versão e na mais recente possível.
   - **Zero Chaves de Fallback Hardcoded**: Nunca colocar fallbacks literais (ex.: proibir `process.env.DATABASE_URL || "..."`). Obtenha sempre exclusivamente do `.env` com validação de obrigatoriedade.
   - **Padrão de Logs e Mensagens**: Mensagens de erro e validações diretas e padronizadas, sem o uso de `ex:` (ex.: "Formato de placa inválido. Deve ser no padrão Mercosul (BRA2E19) ou Tradicional (ABC1234).").
   - **Padrão de APIs REST**:
     - Rotas de domínio com versionamento explícito sob `/v1` (ex.: `/v1/clients`, `/v1/boxes`).
     - Respostas de erro no padrão RFC 7807/9457 `ProblemDetail` (`application/problem+json`).
     - Criações (`POST`) respondem com `201 Created` e header `Location`.
     - Paginação canônica obrigatória com limites em todas as coleções.

3. **Padrão Git**:
   - Mensagens de commit estritamente no padrão Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`).

4. **Validação**:
   - Validar compatibilidade estrita com TypeScript (`tsc --noEmit`).

---

## Skills do Workspace
- Consulte e utilize as skills em `.agents/skills/`:
  - `rest-api-design`: Padrões canônicos RESTful, RFC 7807 Problem Details, versionamento /v1, header Location e paginação.
  - `backend-scalable-architecture`: Padrões Fastify, Zod, Drizzle/Prisma, Redis e BullMQ.
  - `frontend-modern-ui-ux`: React, Tailwind CSS, Radix UI, TanStack Query e Sonner.
  - `lava-car-domain`: Modelagem de domínio de lava rápido (veículos, agendamentos, OS, checklist).
  - `prompt-enhancer`: Engenharia de prompts e especificações técnicas.
