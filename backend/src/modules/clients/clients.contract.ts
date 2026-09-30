import { Client } from "../../db/schema/clients.js";
import { Vehicle } from "../../db/schema/vehicles.js";

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateClientDTO {
  fullName: string;
  phone: string;
}

export interface ClientWithVehicles extends Client {
  vehicles: Vehicle[];
}

export interface ClientsRepositoryContract {
  create(data: CreateClientDTO): Promise<Client>;
  findById(id: number): Promise<Client | null>;
  findByPhone(phone: string): Promise<Client | null>;
  list(params: PaginationParams): Promise<PaginatedResult<Client>>;
  findWithVehicles(id: number): Promise<ClientWithVehicles | null>;
}