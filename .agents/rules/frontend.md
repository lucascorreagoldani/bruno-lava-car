# Regras de Engenharia Frontend

- Framework e Estilo: React com TypeScript, Tailwind CSS e componentes Radix UI / shadcn/ui.
- Ícones: Lucide React com `strokeWidth={1.75}`.
- Gerenciamento de Estado:
  - TanStack Query (React Query) para dados de servidor e mutações com feedback otimista.
  - Zustand para estado global de cliente e UI (ex: modais, filtros).
- Acessibilidade e UX:
  - Áreas mínimas de toque de 44x44px em botões e inputs interativos.
  - Toda mutação deve exibir feedback visual de loading imediato no botão ou elemento acionado.
  - Notificações com Sonner (toasts).
  - Tratar obrigatoriamente os 4 estados de tela orientada a dados: Carregando (Skeleton), Erro (com Retry), Vazio (com CTA) e Sucesso.
