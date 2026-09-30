import { AppError } from "./app-error.js";

export class ConflictError extends AppError {
  constructor(message = "Já existe um registro com o mesmo ID") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}
