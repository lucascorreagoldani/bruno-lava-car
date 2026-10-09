import {
  BoxesRepositoryContract,
  CreateBoxDTO,
  UpdateBoxDTO,
  BoxFilterParams,
  PaginatedBoxesOutput
} from "./boxes.contract.js";
import { Box, BoxStatus } from "../../db/schema/boxes.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";

export class BoxesService {
  constructor(private readonly boxesRepository: BoxesRepositoryContract) { }

  async createBox(data: CreateBoxDTO): Promise<Box> {
    const trimmedName = data.name.trim();

    const existingBox = await this.boxesRepository.findByName(trimmedName);
    if (existingBox) {
      throw new ConflictError(`Já existe um box cadastrado com o nome "${trimmedName}".`);
    }

    return this.boxesRepository.create({
      name: trimmedName,
      status: data.status || "ACTIVE",
      description: data.description ? data.description.trim() : undefined
    });
  }

  async getBoxById(id: number): Promise<Box> {
    const box = await this.boxesRepository.findById(id);

    if (!box) {
      throw new NotFoundError(`Box com ID ${id} não foi localizado.`);
    }

    return box;
  }

  async listBoxes(params: BoxFilterParams): Promise<PaginatedBoxesOutput> {
    return this.boxesRepository.list(params);
  }

  async updateBox(id: number, data: UpdateBoxDTO): Promise<Box> {
    const box = await this.boxesRepository.findById(id);

    if (!box) {
      throw new NotFoundError(`Box com ID ${id} não foi localizado.`);
    }

    if (data.name) {
      const trimmedName = data.name.trim();
      if (trimmedName.toLowerCase() !== box.name.toLowerCase()) {
        const existingName = await this.boxesRepository.findByName(trimmedName);
        if (existingName) {
          throw new ConflictError(`Já existe outro box cadastrado com o nome "${trimmedName}".`);
        }
      }
    }

    const updated = await this.boxesRepository.update(id, {
      name: data.name ? data.name.trim() : undefined,
      status: data.status,
      description: data.description !== undefined ? data.description.trim() : undefined
    });

    if (!updated) {
      throw new NotFoundError(`Box com ID ${id} não foi localizado.`);
    }

    return updated;
  }

  async updateBoxStatus(id: number, status: BoxStatus): Promise<Box> {
    const box = await this.boxesRepository.findById(id);

    if (!box) {
      throw new NotFoundError(`Box com ID ${id} não foi localizado.`);
    }

    const updated = await this.boxesRepository.update(id, {
      status
    });

    if (!updated) {
      throw new NotFoundError(`Box com ID ${id} não foi localizado.`);
    }

    return updated;
  }

  async deleteBox(id: number): Promise<void> {
    const box = await this.boxesRepository.findById(id);

    if (!box) {
      throw new NotFoundError(`Box com ID ${id} não foi localizado.`);
    }

    await this.boxesRepository.delete(id);
  }
}
