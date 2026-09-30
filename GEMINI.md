# Bruno Lava Car - Configuração de Agentes e Instruções do Projeto

Este arquivo define as regras e o ecossistema de agentes para o projeto **Bruno Lava Car**.

---

## Regras Obrigatórias de Workflow e Qualidade
1. **Entrega de Código 100% Funcional**:
   - Sempre forneça arquivos e snippets completos com imports, tipagens e exports.
   - Proibido o uso de marcadores como `... resto do código ...`.
   - Evite comentários de linha dupla `//` no corpo do código; priorize código limpo e autoexplicativo com tipagem rigorosa.

2. **Padrão Git**:
   - Mensagens de commit estritamente no padrão Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`).

3. **Validação**:
   - Validar compatibilidade estrita com TypeScript (`tsc --noEmit`).

---

## Skills do Workspace
- Consulte e utilize as skills em `.agents/skills/`:
  - `backend-scalable-architecture`: Padrões Fastify, Zod, Drizzle/Prisma, Redis e BullMQ.
  - `frontend-modern-ui-ux`: React, Tailwind CSS, Radix UI, TanStack Query e Sonner.
  - `lava-car-domain`: Modelagem de domínio de lava rápido (veículos, agendamentos, OS, checklist).
  - `prompt-enhancer`: Engenharia de prompts e especificações técnicas.
