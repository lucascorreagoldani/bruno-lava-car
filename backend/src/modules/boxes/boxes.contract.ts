import { Box, BoxStatus } from "../../db/schema/boxes.js";

export interface CreateBoxDTO {
  name: string;
  status?: BoxStatus;
  description?: string;
}

export interface UpdateBoxDTO {
  name?: string;
  status?: BoxStatus;
  description?: string;
}

export interface BoxFilterParams {
  page?: number;
  limit?: number;
  status?: BoxStatus;
  search?: string;
}

export interface PaginatedBoxesOutput {
  items: Box[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BoxesRepositoryContract {
  create(data: CreateBoxDTO): Promise<Box>;
  findById(id: number): Promise<Box | null>;
  findByName(name: string): Promise<Box | null>;
  list(params: BoxFilterParams): Promise<PaginatedBoxesOutput>;
  update(id: number, data: UpdateBoxDTO): Promise<Box | null>;
  delete(id: number): Promise<boolean>;
}
