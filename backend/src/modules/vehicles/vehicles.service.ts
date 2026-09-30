import { VehiclesRepositoryContract, VehicleWithOwner } from "./vehicles.contract.js";
import { ClientsRepositoryContract } from "../clients/clients.contract.js";
import { Vehicle, VehicleCategory } from "../../db/schema/vehicles.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { sanitizeAndValidatePlate, formatPlateForDisplay } from "../../shared/validators/plate-validator.js";

export interface CreateVehicleDTO {
  plate: string;
  clientId: number;
  brand: string;
  model: string;
  color: string;
  year?: number;
  category: VehicleCategory;
}

export class VehiclesService {
  constructor(
    private readonly vehiclesRepository: VehiclesRepositoryContract,
    private readonly clientsRepository: ClientsRepositoryContract
  ) { }

  async createVehicle(data: CreateVehicleDTO): Promise<Vehicle & { formattedPlate: string }> {
    const cleanPlate = sanitizeAndValidatePlate(data.plate);

    const existingVehicle = await this.vehiclesRepository.findByPlate(cleanPlate);
    if (existingVehicle) {
      throw new ConflictError(`Veículo com a placa ${cleanPlate} já está cadastrado no sistema.`);
    }

    const client = await this.clientsRepository.findById(data.clientId);
    if (!client) {
      throw new NotFoundError(`Cliente com ID ${data.clientId} não foi localizado.`);
    }

    const created = await this.vehiclesRepository.create({
      plate: cleanPlate,
      clientId: data.clientId,
      brand: data.brand.trim(),
      model: data.model.trim(),
      color: data.color.trim(),
      year: data.year,
      category: data.category
    });

    return {
      ...created,
      formattedPlate: formatPlateForDisplay(created.plate)
    };
  }

  async getVehicleByPlate(rawPlate: string): Promise<VehicleWithOwner & { formattedPlate: string }> {
    const cleanPlate = sanitizeAndValidatePlate(rawPlate);

    const result = await this.vehiclesRepository.findByPlateWithOwner(cleanPlate);
    if (!result) {
      throw new NotFoundError(`Veículo com a placa ${cleanPlate} não foi localizado.`);
    }

    return {
      ...result,
      formattedPlate: formatPlateForDisplay(result.vehicle.plate)
    };
  }
}
