import { env } from "./env";

export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const url = `${env.VITE_API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json, application/problem+json",
    ...init?.headers
  };

  const response = await fetch(url, {
    ...init,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      typeof errorBody.detail === "string"
        ? errorBody.detail
        : typeof errorBody.message === "string"
          ? errorBody.message
          : `Erro de comunicação com a API (HTTP ${response.status})`;

    throw new ApiError(message, response.status, errorBody);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, init?: RequestInit) =>
    request<T>(endpoint, { ...init, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>(endpoint, {
      ...init,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    }),
  patch: <T>(endpoint: string, body?: unknown, init?: RequestInit) =>
    request<T>(endpoint, {
      ...init,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: <T>(endpoint: string, init?: RequestInit) =>
    request<T>(endpoint, { ...init, method: "DELETE" })
};
