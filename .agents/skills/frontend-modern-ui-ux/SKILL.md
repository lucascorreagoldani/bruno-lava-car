---
name: frontend-modern-ui-ux
description: >-
  Use this skill whenever designing, implementing, or refactoring frontend user interfaces,
  React components, Tailwind CSS styling, UX flows, animations, and accessible data views.
---

# Diretrizes de Frontend Moderno e UI/UX de Alto Padrão

## 1. Stack Tecnológica e Estado
- **Framework & Build**: React com TypeScript estrito sobre Vite ou Next.js (App Router).
- **Estilização**: Tailwind CSS com foco em variáveis semânticas e design tokens limpos.
- **Componentes Base**: Radix UI ou componentes no estilo shadcn/ui (acessibilidade nativa WAI-ARIA, controle total sobre marcação sem estilos opinativos pesados).
- **Ícones**: Lucide React com espessura de traço consistente (`strokeWidth={1.75}`).
- **Gerenciamento de Estado**:
  - **Server State**: TanStack Query (React Query) para caching, revalidação em background, deduplicação de requisições e mutações com feedback otimista.
  - **Client State**: Zustand para estados globais leves (carrinho, filtros, modal ativo); `useState`/`useReducer` para estado estritamente local de componentes.

## 2. Princípios de Layout e Estética Visual Clean
- **Tipografia**: Fontes neutras e legíveis (Inter, Geist Sans ou DM Sans) com escala tipográfica proporcional e espaçamento de linha ajustado (`tracking-tight` em títulos destacados).
- **Espaçamento e Respiro**: Uso intencional de áreas de respiro com paddings generosos (`p-6`, `p-8`, `gap-6`), eliminando poluição visual e bordas excessivas.
- **Paleta de Cores e Contraste**:
  - Base monocromática equilibrada com cinzas neutros (`slate`, `zinc` ou `neutral`).
  - Cor de destaque única e consistente para chamadas de ação primárias (botões principais, links ativos).
  - Sombras suaves e difusas (`shadow-sm`, `shadow-md` com opacidade reduzida) em vez de bordas duras em cartões e containers.
- **Hierarquia Visual**:
  - Títulos com peso `font-semibold` ou `font-bold`.
  - Textos secundários, metadados e legendas sempre atenuados (`text-muted-foreground` ou cinza neutro).
  - Cartões elevados discretamente com superfícies de fundo diferenciadas (`bg-card` sobre `bg-background`).

## 3. Experiência de Uso (UX) e Estados da Interface
- **Mobile-First Real**: Navegação ergonômica com áreas de toque mínimas de 44x44px em botões e inputs interativos.
- **Feedback Imediato**:
  - Nenhuma ação do usuário pode ficar sem resposta visual: todo botão de envio deve entrar em estado de `loading` (com spinner ou skeleton de bloqueio) e desabilitar cliques repetidos.
  - Uso de micro-interações discretas com transições suaves de 150ms a 200ms (`transition-all duration-200 ease-out`).
  - Notificações de sucesso ou erro exibidas via Toasts flutuantes (ex.: Sonner) sem bloquear a visualização da tela.
- **Telas de Carregamento**: Priorize esqueletos de conteúdo (Skeleton Loaders) com as mesmas dimensões dos cartões e tabelas finais em vez de indicadores de progresso globais no centro da página.
- **Empty States Significativos**: Toda visualização sem dados (como histórico vazio ou sem agendamentos) deve conter ilustração vetorial minimalista, explicação concisa e um botão de ação rápida para iniciar o fluxo.

## 4. Engenharia de Componentes e Código
- Separe componentes por responsabilidade:
  - `components/ui/`: Componentes visuais atômicos puros e reutilizáveis (botões, inputs, cards, diálogos).
  - `components/modules/<nome>/`: Componentes com regras de negócio e acoplamento a hooks de busca de dados.
- Não deixe tipos com `any`. Crie interfaces explícitas para as propriedades de cada componente.
- Trate sempre os quatro estados de qualquer tela orientada a dados: carregando (loading), erro com botão de repetição (retry), lista vazia (empty) e exibição dos dados (success).
- Veja o exemplo de implementação dos 4 estados em [data-view-template.tsx](./examples/data-view-template.tsx).
