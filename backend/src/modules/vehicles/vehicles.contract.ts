import { Vehicle, NewVehicle, VehicleCategory } from "../../db/schema/vehicles.js";
import { Client } from "../../db/schema/clients.js";
import { PaginatedResult } from "../clients/clients.contract.js";

export interface VehicleWithOwner {
  vehicle: Vehicle;
  client: Client;
}

export interface VehicleFilterParams {
  page: number;
  limit: number;
  search?: string;
  brand?: string;
  category?: VehicleCategory;
  clientId?: number;
}

export interface UpdateVehicleDTO {
  clientId?: number;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  category?: VehicleCategory;
}

export interface VehiclesRepositoryContract {
  create(data: NewVehicle): Promise<Vehicle>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByPlateWithOwner(plate: string): Promise<VehicleWithOwner | null>;
  list(params: VehicleFilterParams): Promise<PaginatedResult<VehicleWithOwner>>;
  listByClientId(clientId: number): Promise<Vehicle[]>;
  update(plate: string, data: UpdateVehicleDTO): Promise<Vehicle | null>;
  delete(plate: string): Promise<boolean>;
}
