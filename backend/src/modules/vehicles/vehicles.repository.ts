import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index.js";
import { vehicles, Vehicle, NewVehicle } from "../../db/schema/vehicles.js";
import { VehiclesRepositoryContract, VehicleWithOwner } from "./vehicles.contract.js";

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

  async listByClientId(clientId: number): Promise<Vehicle[]> {
    return this.database
      .select()
      .from(vehicles)
      .where(eq(vehicles.clientId, clientId));
  }
}
