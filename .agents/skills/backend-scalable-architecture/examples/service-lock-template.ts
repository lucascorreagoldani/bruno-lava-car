import Redis from "ioredis";

export interface DatabaseTransactionContext {
  appointment: {
    findConflicting(boxId: string, scheduledAt: Date): Promise<boolean>;
    create(data: {
      customerId: string;
      vehiclePlate: string;
      boxId: string;
      scheduledAt: Date;
      serviceIds: string[];
      totalPrice: number;
    }): Promise<{ id: string; scheduledAt: Date; totalPrice: number; status: string }>;
  };
}

export interface DatabaseConnection {
  transaction<T>(callback: (tx: DatabaseTransactionContext) => Promise<T>): Promise<T>;
}

export interface ScheduleParams {
  customerId: string;
  vehiclePlate: string;
  serviceIds: string[];
  scheduledAt: string;
  boxId: string;
}

export class ScheduleAppointmentService {
  constructor(
    private readonly redisClient: Redis,
    private readonly database: DatabaseConnection
  ) { }

  async execute(params: ScheduleParams) {
    const lockKey = `lock:box:${params.boxId}:${params.scheduledAt}`;
    const lockTtlSeconds = 10;
    const lockAcquired = await this.redisClient.set(lockKey, "locked", "EX", lockTtlSeconds, "NX");

    if (!lockAcquired) {
      const error = new Error("Este box já está em processo de reserva para este horário. Tente novamente em instantes.");
      error.name = "ConflictError";
      throw error;
    }

    try {
      const scheduledDate = new Date(params.scheduledAt);

      return await this.database.transaction(async (tx) => {
        const hasConflict = await tx.appointment.findConflicting(params.boxId, scheduledDate);

        if (hasConflict) {
          const conflictError = new Error("Horário indisponível para o box selecionado.");
          conflictError.name = "ConflictError";
          throw conflictError;
        }

        const calculatedPrice = 80.0;

        return await tx.appointment.create({
          customerId: params.customerId,
          vehiclePlate: params.vehiclePlate,
          boxId: params.boxId,
          scheduledAt: scheduledDate,
          serviceIds: params.serviceIds,
          totalPrice: calculatedPrice
        });
      });
    } finally {
      await this.redisClient.del(lockKey);
    }
  }
}
