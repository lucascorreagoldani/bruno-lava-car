import { eq, or, ilike, desc, count } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index.js";
import { clients, Client } from "../../db/schema/clients.js";
import {
  ClientsRepositoryContract,
  CreateClientDTO,
  PaginationParams,
  PaginatedResult,
  ClientWithVehicles
} from "./clients.contract.js";

export class DrizzleClientsRepository implements ClientsRepositoryContract {
  constructor(private readonly database: NodePgDatabase<typeof schema>) { }

  async create(data: CreateClientDTO): Promise<Client> {
    const [created] = await this.database
      .insert(clients)
      .values({
        fullName: data.fullName,
        phone: data.phone
      })
      .returning();

    if (!created) {
      throw new Error("Falha ao registrar cliente.");
    }

    return created;
  }

  async findById(id: number): Promise<Client | null> {
    const [client] = await this.database
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    return client || null;
  }

  async findByPhone(phone: string): Promise<Client | null> {
    const [client] = await this.database
      .select()
      .from(clients)
      .where(eq(clients.phone, phone))
      .limit(1);

    return client || null;
  }

  async list(params: PaginationParams): Promise<PaginatedResult<Client>> {
    const offset = (params.page - 1) * params.limit;

    const whereClause = params.search
      ? or(
        ilike(clients.fullName, `%${params.search}%`),
        ilike(clients.phone, `%${params.search}%`)
      )
      : undefined;

    const [totalRecord] = await this.database
      .select({ count: count() })
      .from(clients)
      .where(whereClause);

    const total = totalRecord?.count || 0;

    const items = await this.database
      .select()
      .from(clients)
      .where(whereClause)
      .orderBy(desc(clients.createdAt))
      .limit(params.limit)
      .offset(offset);

    const totalPages = Math.ceil(total / params.limit) || 1;

    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages
    };
  }

  async findWithVehicles(id: number): Promise<ClientWithVehicles | null> {
    const result = await this.database.query.clients.findFirst({
      where: eq(clients.id, id),
      with: {
        vehicles: true
      }
    });

    return result || null;
  }
}