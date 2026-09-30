import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

export function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }));

    return reply.status(400).send({
      statusCode: 400,
      error: "BAD_REQUEST",
      message: "Falha na validação dos dados de entrada",
      details
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
      details: error.details
    });
  }

  const pgError = error as { code?: string; detail?: string };
  if (pgError.code === "23505") {
    return reply.status(409).send({
      statusCode: 409,
      error: "CONFLICT",
      message: "Registro duplicado no banco de dados.",
      details: pgError.detail ? [{ message: pgError.detail }] : []
    });
  }

  if (pgError.code === "23503") {
    return reply.status(400).send({
      statusCode: 400,
      error: "FOREIGN_KEY_VIOLATION",
      message: "O registro informado não existe ou não pôde ser associado.",
      details: pgError.detail ? [{ message: pgError.detail }] : []
    });
  }

  request.log.error(error);

  return reply.status(500).send({
    statusCode: 500,
    error: "INTERNAL_SERVER_ERROR",
    message: "Ocorreu um erro interno no servidor.",
    details: []
  });
}
