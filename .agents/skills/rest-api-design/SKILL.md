---
name: rest-api-design
description: >-
  Diretrizes de excelência para design, modelagem, manutenção e governança de APIs RESTful no projeto Bruno Lava Car.
  Cobre RFC 7807/9457 Problem Details, versionamento /v1, paginação canônica, cabeçalho Location, OpenAPI e nomenclatura semântica de recursos.
---

# Diretrizes de Excelência em Design de APIs REST (Bruno Lava Car)

Este documento define os padrões canônicos para desenvolvimento, manutenção e consumo de APIs REST no ecossistema **Bruno Lava Car**, garantindo interoperabilidade, previsibilidade e máxima aderência ao Modelo de Maturidade de Richardson (Nível 2 e 3).

---

## 1. As 6 Decisões Arquiteturais Inegociáveis

### 1.1. Recursos Semânticos em vez de Verbos RPC
- **Regra**: URIs identificam **substantivos** e coleções no plural, nunca ações ou verbos procedurais.
- **Evite**: `/buscarPedido?id=42`, `/criarCliente`, `/deletarVeiculo?id=10`.
- **Prefira**:
  - `GET /v1/pedidos/42`
  - `POST /v1/clientes`
  - `DELETE /v1/veiculos/10`
- **Sub-recursos**: Utilize aninhamento hierárquico quando uma entidade pertencer estritamente a outra:
  - `GET /v1/clientes/:id/veiculos`
  - `PATCH /v1/boxes/:id/status`

### 1.2. Respostas de Erro Padronizadas com RFC 7807 / RFC 9457 (Problem Details)
- **Regra**: Nunca retorne HTTP 200 contendo payload de erro. Utilize status codes HTTP semânticos (400, 401, 403, 404, 409, 422, 500) e formate o corpo estritamente de acordo com a **RFC 7807 / RFC 9457** (`Content-Type: application/problem+json`).
- **Estrutura Obrigatória de Erro**:
```json
{
  "type": "https://api.brunolavacar.com/errors/not-found",
  "title": "Recurso Não Encontrado",
  "status": 404,
  "detail": "Box com ID 99 não foi localizado no sistema.",
  "instance": "/v1/boxes/99",
  "invalidParams": []
}
```
- Em caso de validação com múltiplos campos (ex.: validação Zod), preencha o array `invalidParams`:
```json
{
  "type": "https://api.brunolavacar.com/errors/validation-error",
  "title": "Erro de Validação de Dados",
  "status": 400,
  "detail": "Um ou mais campos enviados na requisição são inválidos.",
  "instance": "/v1/clientes",
  "invalidParams": [
    {
      "name": "phone",
      "reason": "Número de telefone inválido para o país especificado."
    }
  ]
}
```

### 1.3. Paginação Obrigatória e Bounded Limits
- **Regra**: Toda listagem de coleção deve implementar paginação padrão para prevenir degradação de performance e consumo excessivo de memória.
- **Parâmetros de Consulta**:
  - `page`: Número da página (iniciando em 1, padrão 1).
  - `limit`: Quantidade de itens por página (padrão 20, mínimo 1, máximo obrigatório 100).
- **Envelope de Resposta Paginada**:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 1.4. Resposta 201 Created com Cabeçalho `Location`
- **Regra**: Toda requisição `POST` que resulte na criação persistida de um recurso deve retornar status `201 Created` e incluir obrigatoriamente o cabeçalho HTTP `Location` contendo a URI canônica do recurso criado (RFC 9110 § 15.3.2).
- **Exemplo**:
  - `POST /v1/boxes` -> Resposta:
    - Status: `201 Created`
    - Cabeçalho: `Location: /v1/boxes/4`
    - Payload: Dados do recurso recém-criado.

### 1.5. Versionamento Explícito na URI (`/v1`)
- **Regra**: Todos os endpoints de negócio do sistema devem ser obrigatoriamente prefixados com a versão principal da API (`/v1`).
- **Estrutura**:
  - Rotas de Sistema/Infraestrutura: `/health`, `/documentation`
  - Rotas de Negócio: `/v1/clients`, `/v1/vehicles`, `/v1/services`, `/v1/boxes`
- O versionamento previne quebras de contrato (breaking changes) em clientes web, mobile ou integrações de terceiros.

### 1.6. Contrato Vivo OpenAPI / Swagger (Single Source of Truth)
- **Regra**: O contrato da API não deve residir apenas no código-fonte. Todo endpoint deve possuir schema Fastify / OpenAPI sincronizado com Zod contendo:
  - `tags`: Agrupamento semântico do domínio.
  - `summary` e `description`: Finalidade operacional.
  - `querystring`, `params` e `body`: Validados estritamente.
  - `response`: Mapeamento de status `200`, `201`, `400`, `404`, `409` e `500` com formato Problem Details.
  - Acesso público interativo via Swagger UI (`/documentation`).

---

## 2. Guia de Implementação e Uso nos Controladores Fastify

```typescript
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createSchema.parse(request.body);
    const created = await this.exampleService.create(input);

    return reply
      .header("Location", `/v1/recurso/${created.id}`)
      .status(201)
      .send({
        statusCode: 201,
        message: "Recurso criado com sucesso",
        data: created
      });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = paginationQuerySchema.parse(request.query);
    const { items, total } = await this.exampleService.list(query);

    return reply.status(200).send({
      data: items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit)
      }
    });
  }
}
```
