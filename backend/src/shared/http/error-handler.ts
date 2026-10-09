import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { createProblemDetails } from "../errors/problem-details.js";

function getTitleForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Requisição Inválida";
    case 401:
      return "Não Autorizado";
    case 403:
      return "Acesso Proibido";
    case 404:
      return "Recurso Não Encontrado";
    case 409:
      return "Conflito de Dados";
    case 422:
      return "Entidade Não Processável";
    case 500:
    default:
      return "Erro Interno do Servidor";
  }
}

export function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  reply.header("Content-Type", "application/problem+json; charset=utf-8");

  if (error instanceof ZodError) {
    const invalidParams = error.issues.map((issue) => ({
      name: issue.path.join("."),
      reason: issue.message
    }));

    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));

    const problem = createProblemDetails({
      typeUri: "validation-error",
      title: "Erro de Validação de Dados",
      status: 400,
      detail: "Um ou mais campos enviados na requisição são inválidos.",
      instance: request.url,
      errorCode: "BAD_REQUEST",
      invalidParams,
      details
    });

    return reply.status(400).send(problem);
  }

  if (error instanceof AppError) {
    const problem = createProblemDetails({
      typeUri: error.error.toLowerCase().replace(/_/g, "-"),
      title: getTitleForStatus(error.statusCode),
      status: error.statusCode,
      detail: error.message,
      instance: request.url,
      errorCode: error.error,
      details: error.details
    });

    return reply.status(error.statusCode).send(problem);
  }

  const pgError = error as { code?: string; detail?: string };
  if (pgError.code === "23505") {
    const problem = createProblemDetails({
      typeUri: "conflict",
      title: "Conflito de Dados",
      status: 409,
      detail: "Registro duplicado no banco de dados.",
      instance: request.url,
      errorCode: "CONFLICT",
      details: pgError.detail ? [{ message: pgError.detail }] : []
    });

    return reply.status(409).send(problem);
  }

  if (pgError.code === "23503") {
    const problem = createProblemDetails({
      typeUri: "foreign-key-violation",
      title: "Violação de Chave Estrangeira",
      status: 400,
      detail: "O registro informado não existe ou não pôde ser associado.",
      instance: request.url,
      errorCode: "FOREIGN_KEY_VIOLATION",
      details: pgError.detail ? [{ message: pgError.detail }] : []
    });

    return reply.status(400).send(problem);
  }

  request.log.error(error);

  const problem = createProblemDetails({
    typeUri: "internal-server-error",
    title: "Erro Interno do Servidor",
    status: 500,
    detail: "Ocorreu um erro interno no servidor.",
    instance: request.url,
    errorCode: "INTERNAL_SERVER_ERROR",
    details: []
  });

  return reply.status(500).send(problem);
}
