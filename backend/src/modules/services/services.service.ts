import {
  ServicesRepositoryContract,
  ServiceWithPrices,
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceFilterParams
} from "./services.contract.js";
import { ServicePrice } from "../../db/schema/service-prices.js";
import { VehicleCategory } from "../../db/schema/enums/vehicle-category.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";

export function formatPriceBRL(priceInCents: number): string {
  const valueInReais = priceInCents / 100;
  return valueInReais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export interface FormattedServicePrice extends ServicePrice {
  formattedPrice: string;
}

export interface FormattedServiceWithPrices extends Omit<ServiceWithPrices, "prices"> {
  prices: FormattedServicePrice[];
}

export interface CalculatedServicePrice {
  serviceId: number;
  serviceName: string;
  durationMinutes: number;
  category: VehicleCategory;
  priceInCents: number;
  formattedPrice: string;
}

export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepositoryContract) { }

  private formatServiceOutput(service: ServiceWithPrices): FormattedServiceWithPrices {
    const formattedPrices: FormattedServicePrice[] = (service.prices || []).map((item) => ({
      ...item,
      formattedPrice: formatPriceBRL(item.priceInCents)
    }));

    return {
      ...service,
      prices: formattedPrices
    };
  }

  async createService(data: CreateServiceDTO): Promise<FormattedServiceWithPrices> {
    const trimmedName = data.name.trim();

    const existingService = await this.servicesRepository.findByName(trimmedName);
    if (existingService) {
      throw new ConflictError(`Já existe um serviço cadastrado com o nome "${trimmedName}".`);
    }

    const created = await this.servicesRepository.create({
      name: trimmedName,
      description: data.description ? data.description.trim() : undefined,
      durationMinutes: data.durationMinutes,
      prices: data.prices
    });

    return this.formatServiceOutput(created);
  }

  async getServiceById(id: number): Promise<FormattedServiceWithPrices> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundError(`Serviço com ID ${id} não foi localizado.`);
    }

    return this.formatServiceOutput(service);
  }

  async listServices(params: ServiceFilterParams): Promise<FormattedServiceWithPrices[]> {
    const services = await this.servicesRepository.list(params);

    return services.map((service) => this.formatServiceOutput(service));
  }

  async updateService(id: number, data: UpdateServiceDTO): Promise<FormattedServiceWithPrices> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundError(`Serviço com ID ${id} não foi localizado.`);
    }

    if (data.name) {
      const trimmedName = data.name.trim();
      if (trimmedName.toLowerCase() !== service.name.toLowerCase()) {
        const existingName = await this.servicesRepository.findByName(trimmedName);
        if (existingName) {
          throw new ConflictError(`Já existe outro serviço cadastrado com o nome "${trimmedName}".`);
        }
      }
    }

    const updated = await this.servicesRepository.update(id, {
      name: data.name ? data.name.trim() : undefined,
      description: data.description !== undefined ? data.description.trim() : undefined,
      durationMinutes: data.durationMinutes,
      active: data.active,
      prices: data.prices
    });

    if (!updated) {
      throw new NotFoundError(`Serviço com ID ${id} não foi localizado.`);
    }

    return this.formatServiceOutput(updated);
  }

  async toggleActive(id: number): Promise<FormattedServiceWithPrices> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundError(`Serviço com ID ${id} não foi localizado.`);
    }

    const updated = await this.servicesRepository.update(id, {
      active: !service.active
    });

    if (!updated) {
      throw new NotFoundError(`Serviço com ID ${id} não foi localizado.`);
    }

    return this.formatServiceOutput(updated);
  }

  async deleteService(id: number): Promise<void> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundError(`Serviço com ID ${id} não foi localizado.`);
    }

    await this.servicesRepository.delete(id);
  }

  async calculatePriceForCategory(id: number, category: VehicleCategory): Promise<CalculatedServicePrice> {
    const service = await this.servicesRepository.findById(id);

    if (!service) {
      throw new NotFoundError(`Serviço com ID ${id} não foi localizado.`);
    }

    const priceRecord = await this.servicesRepository.getPriceForCategory(id, category);

    if (!priceRecord) {
      throw new NotFoundError(`Preço não configurado para a categoria ${category} no serviço "${service.name}".`);
    }

    return {
      serviceId: service.id,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      category,
      priceInCents: priceRecord.priceInCents,
      formattedPrice: formatPriceBRL(priceRecord.priceInCents)
    };
  }
}
