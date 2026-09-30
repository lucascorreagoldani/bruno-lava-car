import {
  VehiclesRepositoryContract,
  VehicleWithOwner,
  VehicleFilterParams,
  UpdateVehicleDTO
} from "./vehicles.contract.js";
import { ClientsRepositoryContract, PaginatedResult } from "../clients/clients.contract.js";
import { Vehicle, VehicleCategory } from "../../db/schema/vehicles.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { sanitizeAndValidatePlate, formatPlateForDisplay } from "../../shared/validators/plate-validator.js";
import { formatPhoneForDisplay } from "../../shared/validators/phone-validator.js";

export interface CreateVehicleDTO {
  plate: string;
  clientId: number;
  brand: string;
  model: string;
  color: string;
  year?: number;
  category: VehicleCategory;
}

export interface FormattedVehicleWithOwner {
  vehicle: Vehicle & { formattedPlate: string };
  client: VehicleWithOwner["client"] & { formattedPhone: string };
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

  async getVehicleByPlate(rawPlate: string): Promise<FormattedVehicleWithOwner> {
    const cleanPlate = sanitizeAndValidatePlate(rawPlate);

    const result = await this.vehiclesRepository.findByPlateWithOwner(cleanPlate);
    if (!result) {
      throw new NotFoundError(`Veículo com a placa ${cleanPlate} não foi localizado.`);
    }

    return {
      vehicle: {
        ...result.vehicle,
        formattedPlate: formatPlateForDisplay(result.vehicle.plate)
      },
      client: {
        ...result.client,
        formattedPhone: formatPhoneForDisplay(result.client.phone)
      }
    };
  }

  async listVehicles(params: VehicleFilterParams): Promise<PaginatedResult<FormattedVehicleWithOwner>> {
    const result = await this.vehiclesRepository.list(params);

    const formattedItems: FormattedVehicleWithOwner[] = result.items.map((item) => ({
      vehicle: {
        ...item.vehicle,
        formattedPlate: formatPlateForDisplay(item.vehicle.plate)
      },
      client: {
        ...item.client,
        formattedPhone: formatPhoneForDisplay(item.client.phone)
      }
    }));

    return {
      ...result,
      items: formattedItems
    };
  }

  async updateVehicle(rawPlate: string, data: UpdateVehicleDTO): Promise<Vehicle & { formattedPlate: string }> {
    const cleanPlate = sanitizeAndValidatePlate(rawPlate);

    const vehicle = await this.vehiclesRepository.findByPlate(cleanPlate);
    if (!vehicle) {
      throw new NotFoundError(`Veículo com a placa ${cleanPlate} não foi localizado.`);
    }

    if (data.clientId !== undefined) {
      const client = await this.clientsRepository.findById(data.clientId);
      if (!client) {
        throw new NotFoundError(`Cliente com ID ${data.clientId} não foi localizado.`);
      }
    }

    const updated = await this.vehiclesRepository.update(cleanPlate, {
      clientId: data.clientId,
      brand: data.brand ? data.brand.trim() : undefined,
      model: data.model ? data.model.trim() : undefined,
      color: data.color ? data.color.trim() : undefined,
      year: data.year,
      category: data.category
    });

    if (!updated) {
      throw new NotFoundError(`Veículo com a placa ${cleanPlate} não foi localizado.`);
    }

    return {
      ...updated,
      formattedPlate: formatPlateForDisplay(updated.plate)
    };
  }

  async deleteVehicle(rawPlate: string): Promise<void> {
    const cleanPlate = sanitizeAndValidatePlate(rawPlate);

    const vehicle = await this.vehiclesRepository.findByPlate(cleanPlate);
    if (!vehicle) {
      throw new NotFoundError(`Veículo com a placa ${cleanPlate} não foi localizado.`);
    }

    await this.vehiclesRepository.delete(cleanPlate);
  }
}
