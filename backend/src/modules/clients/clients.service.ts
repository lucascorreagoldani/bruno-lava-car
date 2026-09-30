import {
  ClientsRepositoryContract,
  CreateClientDTO,
  UpdateClientDTO,
  PaginationParams,
  PaginatedResult
} from "./clients.contract.js";
import { Client } from "../../db/schema/clients.js";
import { Vehicle } from "../../db/schema/vehicles.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { sanitizeAndValidatePhone, formatPhoneForDisplay } from "../../shared/validators/phone-validator.js";

export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepositoryContract) { }

  async createClient(data: CreateClientDTO): Promise<Client & { formattedPhone: string }> {
    const canonicalPhone = sanitizeAndValidatePhone(data.phone);

    const existingClient = await this.clientsRepository.findByPhone(canonicalPhone);
    if (existingClient) {
      throw new ConflictError(`Já existe um cliente cadastrado com o telefone ${data.phone}.`);
    }

    const createdClient = await this.clientsRepository.create({
      fullName: data.fullName.trim(),
      phone: canonicalPhone
    });

    return {
      ...createdClient,
      formattedPhone: formatPhoneForDisplay(createdClient.phone)
    };
  }

  async getClientById(id: number): Promise<Client & { formattedPhone: string }> {
    const client = await this.clientsRepository.findById(id);

    if (!client) {
      throw new NotFoundError(`Cliente com ID ${id} não foi localizado.`);
    }

    return {
      ...client,
      formattedPhone: formatPhoneForDisplay(client.phone)
    };
  }

  async listClients(params: PaginationParams): Promise<PaginatedResult<Client & { formattedPhone: string }>> {
    const result = await this.clientsRepository.list(params);

    const formattedItems = result.items.map((client) => ({
      ...client,
      formattedPhone: formatPhoneForDisplay(client.phone)
    }));

    return {
      ...result,
      items: formattedItems
    };
  }

  async getClientVehicles(clientId: number): Promise<{ client: Client; vehicles: Vehicle[] }> {
    const clientWithVehicles = await this.clientsRepository.findWithVehicles(clientId);

    if (!clientWithVehicles) {
      throw new NotFoundError(`Cliente com ID ${clientId} não foi localizado.`);
    }

    const { vehicles, ...clientData } = clientWithVehicles;

    return {
      client: {
        ...clientData,
        phone: clientData.phone
      },
      vehicles
    };
  }

  async updateClient(id: number, data: UpdateClientDTO): Promise<Client & { formattedPhone: string }> {
    const client = await this.clientsRepository.findById(id);

    if (!client) {
      throw new NotFoundError(`Cliente com ID ${id} não foi localizado.`);
    }

    let canonicalPhone: string | undefined;

    if (data.phone) {
      canonicalPhone = sanitizeAndValidatePhone(data.phone);

      if (canonicalPhone !== client.phone) {
        const phoneHolder = await this.clientsRepository.findByPhone(canonicalPhone);
        if (phoneHolder) {
          throw new ConflictError(`Já existe outro cliente cadastrado com o telefone ${data.phone}.`);
        }
      }
    }

    const updated = await this.clientsRepository.update(id, {
      fullName: data.fullName ? data.fullName.trim() : undefined,
      phone: canonicalPhone
    });

    if (!updated) {
      throw new NotFoundError(`Cliente com ID ${id} não foi localizado.`);
    }

    return {
      ...updated,
      formattedPhone: formatPhoneForDisplay(updated.phone)
    };
  }

  async deleteClient(id: number): Promise<void> {
    const client = await this.clientsRepository.findById(id);

    if (!client) {
      throw new NotFoundError(`Cliente com ID ${id} não foi localizado.`);
    }

    await this.clientsRepository.delete(id);
  }
}
