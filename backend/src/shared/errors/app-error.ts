export class AppError extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly details: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode = 400,
    error = "BAD_REQUEST",
    details: Array<{ field?: string; message: string }> = []
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
