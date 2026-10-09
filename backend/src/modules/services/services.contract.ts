import { Service } from "../../db/schema/services.js";
import { ServicePrice } from "../../db/schema/service-prices.js";
import { VehicleCategory } from "../../db/schema/enums/vehicle-category.js";

export interface CreateServicePriceDTO {
  category: VehicleCategory;
  priceInCents: number;
}

export interface CreateServiceDTO {
  name: string;
  description?: string;
  durationMinutes: number;
  prices: CreateServicePriceDTO[];
}

export interface UpdateServicePriceDTO {
  category: VehicleCategory;
  priceInCents: number;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  durationMinutes?: number;
  active?: boolean;
  prices?: UpdateServicePriceDTO[];
}

export interface ServiceWithPrices extends Service {
  prices: ServicePrice[];
}

export interface ServiceFilterParams {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
}

export interface PaginatedServicesOutput {
  items: ServiceWithPrices[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServicesRepositoryContract {
  create(data: CreateServiceDTO): Promise<ServiceWithPrices>;
  findById(id: number): Promise<ServiceWithPrices | null>;
  findByName(name: string): Promise<Service | null>;
  list(params: ServiceFilterParams): Promise<PaginatedServicesOutput>;
  update(id: number, data: UpdateServiceDTO): Promise<ServiceWithPrices | null>;
  delete(id: number): Promise<boolean>;
  getPriceForCategory(serviceId: number, category: VehicleCategory): Promise<ServicePrice | null>;
}
