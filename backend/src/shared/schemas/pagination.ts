import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: "Página deve ser um número inteiro" })
    .int("Página deve ser um número inteiro")
    .min(1, "Página deve ser maior ou igual a 1")
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: "Limite deve ser um número inteiro" })
    .int("Limite deve ser um número inteiro")
    .min(1, "Limite deve ser maior ou igual a 1")
    .max(100, "Limite máximo permitido por página é 100 itens")
    .default(20)
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit)
  };
}

export const paginationOpenApiSchema = {
  type: "object",
  properties: {
    page: { type: "number", example: 1 },
    limit: { type: "number", example: 20 },
    total: { type: "number", example: 45 },
    totalPages: { type: "number", example: 3 }
  }
};
