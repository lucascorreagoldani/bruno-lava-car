# Regras de Workflow e Qualidade de Código

## Integridade e Formato de Código
- Todo arquivo criado ou modificado deve ser entregue completo, sem omissões ou seções cortadas com reticências.
- Não incluir comentários iniciados com `//` no corpo do código. A legibilidade deve vir da clareza das variáveis, funções e tipos do TypeScript.
- Respeitar sempre a tipagem estrita do TypeScript (`strict: true`), proibindo o uso de `any`.

## Git Conventional Commits
- `feat:` para novas funcionalidades
- `fix:` para correções de bugs
- `refactor:` para refatorações que não alteram a API pública
- `chore:` para dependências e configs
- `test:` para testes unitários ou de integração
