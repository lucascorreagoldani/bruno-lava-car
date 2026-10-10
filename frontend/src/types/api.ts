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

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
  details?: Array<{ field?: string; message: string }>;
}
