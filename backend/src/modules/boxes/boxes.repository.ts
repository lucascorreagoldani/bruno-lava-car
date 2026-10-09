import { eq, and, ilike, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index.js";
import { boxes, Box } from "../../db/schema/boxes.js";
import {
  BoxesRepositoryContract,
  CreateBoxDTO,
  UpdateBoxDTO,
  BoxFilterParams
} from "./boxes.contract.js";

export class DrizzleBoxesRepository implements BoxesRepositoryContract {
  constructor(private readonly database: NodePgDatabase<typeof schema>) { }

  async create(data: CreateBoxDTO): Promise<Box> {
    const [created] = await this.database
      .insert(boxes)
      .values({
        name: data.name,
        status: data.status,
        description: data.description
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao registrar box.");
    }

    return created;
  }

  async findById(id: number): Promise<Box | null> {
    const [box] = await this.database
      .select()
      .from(boxes)
      .where(eq(boxes.id, id))
      .limit(1);

    return box || null;
  }

  async findByName(name: string): Promise<Box | null> {
    const [box] = await this.database
      .select()
      .from(boxes)
      .where(ilike(boxes.name, name))
      .limit(1);

    return box || null;
  }

  async list(params: BoxFilterParams): Promise<Box[]> {
    const conditions = [];

    if (params.status) {
      conditions.push(eq(boxes.status, params.status));
    }

    if (params.search) {
      conditions.push(ilike(boxes.name, `%${params.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return this.database
      .select()
      .from(boxes)
      .where(whereClause)
      .orderBy(asc(boxes.id));
  }

  async update(id: number, data: UpdateBoxDTO): Promise<Box | null> {
    const [updated] = await this.database
      .update(boxes)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(boxes.id, id))
      .returning();

    return updated || null;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.database
      .delete(boxes)
      .where(eq(boxes.id, id))
      .returning({ id: boxes.id });

    return deleted.length > 0;
  }
}
