import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
  constructor(message = "Registro não encontrado") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
