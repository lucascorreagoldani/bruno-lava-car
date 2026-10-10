import type { ProblemDetail } from "@/types/api";

export class ApiError extends Error {
  public readonly status: number;
  public readonly problemDetail?: ProblemDetail;

  constructor(status: number, message: string, problemDetail?: ProblemDetail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problemDetail = problemDetail;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/v1";

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...headers
    }
  });

  if (!response.ok) {
    let problemDetail: ProblemDetail | undefined;
    let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;

    try {
      const data = await response.json();
      problemDetail = data as ProblemDetail;
      if (problemDetail.detail) {
        errorMessage = problemDetail.detail;
      } else if (data.message) {
        errorMessage = data.message;
      }
    } catch {
      errorMessage = await response.text().catch(() => errorMessage);
    }

    throw new ApiError(response.status, errorMessage, problemDetail);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" })
};
