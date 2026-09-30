# Bruno Lava Car - Diretrizes Globais de Engenharia e Workflow

Este arquivo define as regras universais e inegociáveis aplicadas a todos os agentes e assistentes no workspace **Bruno Lava Car**.

---

## 1. Regras de Entrega de Código
- **Código Completo**: Todo código gerado ou alterado deve ser entregue integralmente, contendo todos os `imports`, interfaces, types e blocos lógicos necessários para execução direta.
- **Proibido Placeholders**: Nunca omita código utilizando comentários ou marcadores como `// ... resto do código ...`, `/* manter lógica anterior */` ou similares.
- **Sem Comentários com Duas Barras**: Não inclua comentários iniciados por `//` no corpo do código de produção. O código deve ser autoexplicativo através de nomenclatura semântica clara e types estritos.
- **Verificação de Tipos**: Todo código TypeScript gerado deve ser compatível com checagem estrita (`tsc --noEmit`).

---

## 2. Padrão de Commits (Conventional Commits)
- `feat: <descrição>` - Novas funcionalidades ou endpoints.
- `fix: <descrição>` - Correção de bugs ou regressões.
- `refactor: <descrição>` - Melhorias e refatorações sem alterar comportamento externo.
- `chore: <descrição>` - Alterações em configurações, build, dependências ou migrations.
- `test: <descrição>` - Adição ou ajuste de testes automatizados.

---

## 3. Arquitetura do Projeto
- **Backend**: Node.js com TypeScript estrito, Fastify, Zod, PostgreSQL (Drizzle/Prisma), Redis (locks para reservas sem concorrência e BullMQ para filas).
- **Frontend**: React com TypeScript, Tailwind CSS, componentes no padrão Radix UI / shadcn, TanStack Query para server state, Zustand para client state.
- **Domínio**: Sistema de gestão e agendamento para lava-rápido e estética automotiva (controle de boxes, status de OS, checklist de entrada e notificações WhatsApp).

---

## 4. Skills Disponíveis no Workspace
O workspace possui skills especializadas ativadas por demanda:
- `backend-scalable-architecture`: Diretrizes e templates para módulos Fastify, repositórios, locks no Redis e tratamento de erros.
- `frontend-modern-ui-ux`: Padrões de telas, 4 estados visuais (loading, error, empty, success), acessibilidade e Tailwind.
- `lava-car-domain`: Regras de negócio, categorias de veículos (Hatch, Sedan, SUV, Picape), fluxo de ordens de serviço (OS) e precificação.
- `prompt-enhancer`: Metodologia para estruturação de prompts e especificações técnicas de engenharia.
