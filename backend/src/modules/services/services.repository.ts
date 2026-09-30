import { eq, and, ilike, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../db/schema/index.js";
import { services, Service } from "../../db/schema/services.js";
import { servicePrices, ServicePrice } from "../../db/schema/service-prices.js";
import { VehicleCategory } from "../../db/schema/enums/vehicle-category.js";
import {
  ServicesRepositoryContract,
  ServiceWithPrices,
  CreateServiceDTO,
  UpdateServiceDTO,
  ServiceFilterParams
} from "./services.contract.js";

export class DrizzleServicesRepository implements ServicesRepositoryContract {
  constructor(private readonly database: NodePgDatabase<typeof schema>) { }

  async create(data: CreateServiceDTO): Promise<ServiceWithPrices> {
    return this.database.transaction(async (tx) => {
      const [createdService] = await tx
        .insert(services)
        .values({
          name: data.name,
          description: data.description,
          durationMinutes: data.durationMinutes,
          active: true
        })
        .returning();

      if (!createdService) {
        throw new Error("Falha ao registrar serviço.");
      }

      const priceRecords = data.prices.map((item) => ({
        serviceId: createdService.id,
        category: item.category,
        priceInCents: item.priceInCents
      }));

      const createdPrices = await tx
        .insert(servicePrices)
        .values(priceRecords)
        .returning();

      return {
        ...createdService,
        prices: createdPrices
      };
    });
  }

  async findById(id: number): Promise<ServiceWithPrices | null> {
    const result = await this.database.query.services.findFirst({
      where: eq(services.id, id),
      with: {
        prices: true
      }
    });

    return result || null;
  }

  async findByName(name: string): Promise<Service | null> {
    const [result] = await this.database
      .select()
      .from(services)
      .where(ilike(services.name, name))
      .limit(1);

    return result || null;
  }

  async list(params: ServiceFilterParams): Promise<ServiceWithPrices[]> {
    const conditions = [];

    if (params.active !== undefined) {
      conditions.push(eq(services.active, params.active));
    }

    if (params.search) {
      conditions.push(ilike(services.name, `%${params.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return this.database.query.services.findMany({
      where: whereClause,
      with: {
        prices: true
      },
      orderBy: desc(services.createdAt)
    });
  }

  async update(id: number, data: UpdateServiceDTO): Promise<ServiceWithPrices | null> {
    return this.database.transaction(async (tx) => {
      const hasBaseFieldsToUpdate =
        data.name !== undefined ||
        data.description !== undefined ||
        data.durationMinutes !== undefined ||
        data.active !== undefined;

      if (hasBaseFieldsToUpdate) {
        await tx
          .update(services)
          .set({
            name: data.name,
            description: data.description,
            durationMinutes: data.durationMinutes,
            active: data.active,
            updatedAt: new Date()
          })
          .where(eq(services.id, id));
      }

      if (data.prices && data.prices.length > 0) {
        for (const item of data.prices) {
          await tx
            .insert(servicePrices)
            .values({
              serviceId: id,
              category: item.category,
              priceInCents: item.priceInCents
            })
            .onConflictDoUpdate({
              target: [servicePrices.serviceId, servicePrices.category],
              set: {
                priceInCents: item.priceInCents,
                updatedAt: new Date()
              }
            });
        }
      }

      const updated = await tx.query.services.findFirst({
        where: eq(services.id, id),
        with: {
          prices: true
        }
      });

      return updated || null;
    });
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await this.database
      .delete(services)
      .where(eq(services.id, id))
      .returning({ id: services.id });

    return deleted.length > 0;
  }

  async getPriceForCategory(serviceId: number, category: VehicleCategory): Promise<ServicePrice | null> {
    const [price] = await this.database
      .select()
      .from(servicePrices)
      .where(
        and(
          eq(servicePrices.serviceId, serviceId),
          eq(servicePrices.category, category)
        )
      )
      .limit(1);

    return price || null;
  }
}
