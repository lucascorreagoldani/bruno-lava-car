import { eq, and, or, ilike, desc, count } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index.js";
import { vehicles, Vehicle, NewVehicle } from "../../db/schema/vehicles.js";
import { Client } from "../../db/schema/clients.js";
import { PaginatedResult } from "../clients/clients.contract.js";
import {
  VehiclesRepositoryContract,
  VehicleWithOwner,
  VehicleFilterParams,
  UpdateVehicleDTO
} from "./vehicles.contract.js";

export class DrizzleVehiclesRepository implements VehiclesRepositoryContract {
  constructor(private readonly database: NodePgDatabase<typeof schema>) { }

  async create(data: NewVehicle): Promise<Vehicle> {
    const [created] = await this.database
      .insert(vehicles)
      .values(data)
      .returning();

    if (!created) {
      throw new Error("Falha ao registrar veículo.");
    }

    return created;
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    const [vehicle] = await this.database
      .select()
      .from(vehicles)
      .where(eq(vehicles.plate, plate))
      .limit(1);

    return vehicle || null;
  }

  async findByPlateWithOwner(plate: string): Promise<VehicleWithOwner | null> {
    const result = await this.database.query.vehicles.findFirst({
      where: eq(vehicles.plate, plate),
      with: {
        client: true
      }
    });

    if (!result || !result.client) {
      return null;
    }

    const { client, ...vehicleData } = result;

    return {
      vehicle: vehicleData,
      client
    };
  }

  async list(params: VehicleFilterParams): Promise<PaginatedResult<VehicleWithOwner>> {
    const offset = (params.page - 1) * params.limit;

    const conditions = [];

    if (params.search) {
      conditions.push(
        or(
          ilike(vehicles.plate, `%${params.search}%`),
          ilike(vehicles.model, `%${params.search}%`)
        )
      );
    }

    if (params.brand) {
      conditions.push(eq(vehicles.brand, params.brand));
    }

    if (params.category) {
      conditions.push(eq(vehicles.category, params.category));
    }

    if (params.clientId) {
      conditions.push(eq(vehicles.clientId, params.clientId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRecord] = await this.database
      .select({ count: count() })
      .from(vehicles)
      .where(whereClause);

    const total = totalRecord?.count || 0;

    const itemsWithClient = await this.database.query.vehicles.findMany({
      where: whereClause,
      with: {
        client: true
      },
      orderBy: desc(vehicles.createdAt),
      limit: params.limit,
      offset
    });

    const items: VehicleWithOwner[] = itemsWithClient
      .filter((item): item is typeof item & { client: Client } => item.client !== null)
      .map(({ client, ...vehicle }) => ({
        vehicle,
        client
      }));

    const totalPages = Math.ceil(total / params.limit) || 1;

    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages
    };
  }

  async listByClientId(clientId: number): Promise<Vehicle[]> {
    return this.database
      .select()
      .from(vehicles)
      .where(eq(vehicles.clientId, clientId));
  }

  async update(plate: string, data: UpdateVehicleDTO): Promise<Vehicle | null> {
    const [updated] = await this.database
      .update(vehicles)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(vehicles.plate, plate))
      .returning();

    return updated || null;
  }

  async delete(plate: string): Promise<boolean> {
    const deleted = await this.database
      .delete(vehicles)
      .where(eq(vehicles.plate, plate))
      .returning({ plate: vehicles.plate });

    return deleted.length > 0;
  }
}
