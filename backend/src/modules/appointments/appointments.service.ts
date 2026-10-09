import {
  AppointmentsRepositoryContract,
  CreateAppointmentInputDTO,
  UpdateAppointmentStatusDTO,
  RescheduleAppointmentDTO,
  AppointmentFilterParams,
  AppointmentWithRelations,
  PaginatedAppointmentsOutput
} from "./appointments.contract.js";
import { AppointmentHistoryRecord } from "../../db/schema/appointment-history.js";
import { ClientsRepositoryContract } from "../clients/clients.contract.js";
import { VehiclesRepositoryContract } from "../vehicles/vehicles.contract.js";
import { ServicesRepositoryContract } from "../services/services.contract.js";
import { BoxesRepositoryContract } from "../boxes/boxes.contract.js";
import { DistributedLock, distributedLock } from "../../shared/redis/distributed-lock.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { VehicleCategory } from "../../db/schema/enums/vehicle-category.js";

export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepositoryContract,
    private readonly clientsRepository: ClientsRepositoryContract,
    private readonly vehiclesRepository: VehiclesRepositoryContract,
    private readonly servicesRepository: ServicesRepositoryContract,
    private readonly boxesRepository: BoxesRepositoryContract,
    private readonly lock: DistributedLock = distributedLock
  ) { }

  async createAppointment(input: CreateAppointmentInputDTO): Promise<AppointmentWithRelations> {
    const lockKey = `lock:box:${input.boxId}`;

    return this.lock.withLock(lockKey, 5000, async () => {
      const client = await this.clientsRepository.findById(input.clientId);
      if (!client) {
        throw new NotFoundError(`Cliente com ID ${input.clientId} não foi localizado.`);
      }

      const vehicle = await this.vehiclesRepository.findByPlate(input.vehiclePlate);
      if (!vehicle) {
        throw new NotFoundError(`Veículo com placa "${input.vehiclePlate}" não foi localizado.`);
      }

      if (vehicle.clientId !== input.clientId) {
        throw new ConflictError(
          `O veículo com placa "${input.vehiclePlate}" não está vinculado ao cliente com ID ${input.clientId}.`
        );
      }

      const box = await this.boxesRepository.findById(input.boxId);
      if (!box) {
        throw new NotFoundError(`Box com ID ${input.boxId} não foi localizado.`);
      }

      if (box.status !== "ACTIVE") {
        throw new ConflictError(
          `O Box "${box.name}" não está ativo no momento (Status atual: ${box.status}). Selecione um box ativo.`
        );
      }

      const service = await this.servicesRepository.findById(input.serviceId);
      if (!service) {
        throw new NotFoundError(`Serviço com ID ${input.serviceId} não foi localizado.`);
      }

      if (!service.active) {
        throw new ConflictError(`O serviço "${service.name}" está inativo no catálogo de serviços.`);
      }

      const priceRecord = await this.servicesRepository.getPriceForCategory(
        input.serviceId,
        vehicle.category as VehicleCategory
      );

      if (!priceRecord) {
        throw new NotFoundError(
          `Preço não configurado para a categoria ${vehicle.category} no serviço "${service.name}".`
        );
      }

      const scheduledAt = new Date(input.scheduledAt);
      const estimatedEndAt = new Date(
        scheduledAt.getTime() + service.durationMinutes * 60 * 1000
      );

      const overlapping = await this.appointmentsRepository.findOverlappingAppointment(
        input.boxId,
        scheduledAt,
        estimatedEndAt
      );

      if (overlapping) {
        throw new ConflictError(
          `O Box "${box.name}" já possui um agendamento conflitante no intervalo solicitado.`
        );
      }

      return this.appointmentsRepository.create({
        clientId: input.clientId,
        vehiclePlate: input.vehiclePlate.toUpperCase(),
        serviceId: input.serviceId,
        boxId: input.boxId,
        scheduledAt,
        estimatedEndAt,
        priceInCents: priceRecord.priceInCents,
        notes: input.notes ? input.notes.trim() : undefined
      });
    });
  }

  async getAppointmentById(id: number): Promise<AppointmentWithRelations> {
    const appointment = await this.appointmentsRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError(`Agendamento com ID ${id} não foi localizado.`);
    }

    return appointment;
  }

  async listAppointments(params: AppointmentFilterParams): Promise<PaginatedAppointmentsOutput> {
    return this.appointmentsRepository.list(params);
  }

  async updateAppointmentStatus(
    id: number,
    input: UpdateAppointmentStatusDTO
  ): Promise<AppointmentWithRelations> {
    const appointment = await this.appointmentsRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError(`Agendamento com ID ${id} não foi localizado.`);
    }

    if (appointment.status === "CANCELLED") {
      throw new ConflictError("Não é permitido alterar o status de um agendamento já cancelado.");
    }

    if (appointment.status === "COMPLETED") {
      throw new ConflictError("Não é permitido alterar o status de um atendimento já concluído.");
    }

    if (input.status === "CANCELLED" && (!input.cancellationReason || input.cancellationReason.trim().length < 3)) {
      throw new ConflictError("Motivo do cancelamento é obrigatório ao cancelar o agendamento.");
    }

    const updated = await this.appointmentsRepository.updateStatus(
      id,
      input.status,
      input.cancellationReason ? input.cancellationReason.trim() : undefined,
      input.notes ? input.notes.trim() : undefined
    );

    if (!updated) {
      throw new NotFoundError(`Agendamento com ID ${id} não foi localizado.`);
    }

    return updated;
  }

  async rescheduleAppointment(
    id: number,
    input: RescheduleAppointmentDTO
  ): Promise<AppointmentWithRelations> {
    const appointment = await this.appointmentsRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError(`Agendamento com ID ${id} não foi localizado.`);
    }

    if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
      throw new ConflictError(
        `Não é possível reagendar um atendimento com status ${appointment.status}.`
      );
    }

    const targetBoxId = input.boxId || appointment.boxId;
    const lockKey = `lock:box:${targetBoxId}`;

    return this.lock.withLock(lockKey, 5000, async () => {
      const box = await this.boxesRepository.findById(targetBoxId);
      if (!box) {
        throw new NotFoundError(`Box com ID ${targetBoxId} não foi localizado.`);
      }

      if (box.status !== "ACTIVE") {
        throw new ConflictError(
          `O Box "${box.name}" não está ativo no momento (Status atual: ${box.status}). Selecione um box ativo.`
        );
      }

      const scheduledAt = new Date(input.scheduledAt);
      const estimatedEndAt = new Date(
        scheduledAt.getTime() + appointment.service.durationMinutes * 60 * 1000
      );

      const overlapping = await this.appointmentsRepository.findOverlappingAppointment(
        targetBoxId,
        scheduledAt,
        estimatedEndAt,
        id
      );

      if (overlapping) {
        throw new ConflictError(
          `O Box "${box.name}" já possui um agendamento conflitante no novo horário solicitado.`
        );
      }

      const updated = await this.appointmentsRepository.reschedule(id, {
        scheduledAt,
        estimatedEndAt,
        boxId: targetBoxId,
        reason: input.reason ? input.reason.trim() : undefined,
        notes: input.notes ? input.notes.trim() : undefined
      });

      if (!updated) {
        throw new NotFoundError(`Agendamento com ID ${id} não foi localizado.`);
      }

      return updated;
    });
  }

  async getAppointmentHistory(id: number): Promise<AppointmentHistoryRecord[]> {
    const appointment = await this.appointmentsRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError(`Agendamento com ID ${id} não foi localizado.`);
    }

    return this.appointmentsRepository.getHistory(id);
  }

  async listClientAppointments(
    clientId: number,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedAppointmentsOutput> {
    const client = await this.clientsRepository.findById(clientId);

    if (!client) {
      throw new NotFoundError(`Cliente com ID ${clientId} não foi localizado.`);
    }

    return this.appointmentsRepository.listByClient(clientId, params);
  }

  async listVehicleAppointments(
    vehiclePlate: string,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedAppointmentsOutput> {
    const vehicle = await this.vehiclesRepository.findByPlate(vehiclePlate);

    if (!vehicle) {
      throw new NotFoundError(`Veículo com placa "${vehiclePlate}" não foi localizado.`);
    }

    return this.appointmentsRepository.listByVehicle(vehiclePlate, params);
  }
}
