import { Vehicle, NewVehicle } from "../../db/schema/vehicles.js";
import { Client } from "../../db/schema/clients.js";

export interface VehicleWithOwner {
  vehicle: Vehicle;
  client: Client;
}

export interface VehiclesRepositoryContract {
  create(data: NewVehicle): Promise<Vehicle>;
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByPlateWithOwner(plate: string): Promise<VehicleWithOwner | null>;
  listByClientId(clientId: number): Promise<Vehicle[]>;
}
