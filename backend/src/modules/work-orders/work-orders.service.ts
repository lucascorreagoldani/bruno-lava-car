import {
  WorkOrdersRepositoryContract,
  CreateWorkOrderInputDTO,
  AddWorkOrderItemDTO,
  UpdateWorkOrderStatusDTO,
  WorkOrderFilterParams,
  WorkOrderWithRelations,
  PaginatedWorkOrdersOutput
} from "./work-orders.contract.js";
import { WorkOrderHistoryRecord } from "../../db/schema/work-order-history.js";
import { ClientsRepositoryContract } from "../clients/clients.contract.js";
import { VehiclesRepositoryContract } from "../vehicles/vehicles.contract.js";
import { ServicesRepositoryContract } from "../services/services.contract.js";
import { BoxesRepositoryContract } from "../boxes/boxes.contract.js";
import { AppointmentsRepositoryContract } from "../appointments/appointments.contract.js";
import { NotificationsServiceContract } from "../notifications/notifications.contract.js";
import { env } from "../../config/env.js";
import { NotFoundError } from "../../shared/errors/not-found-error.js";
import { ConflictError } from "../../shared/errors/conflict-error.js";
import { VehicleCategory } from "../../db/schema/enums/vehicle-category.js";

export class WorkOrdersService {
  constructor(
    private readonly workOrdersRepository: WorkOrdersRepositoryContract,
    private readonly clientsRepository: ClientsRepositoryContract,
    private readonly vehiclesRepository: VehiclesRepositoryContract,
    private readonly servicesRepository: ServicesRepositoryContract,
    private readonly boxesRepository: BoxesRepositoryContract,
    private readonly appointmentsRepository?: AppointmentsRepositoryContract,
    private readonly notificationsService?: NotificationsServiceContract
  ) { }

  async createWorkOrder(input: CreateWorkOrderInputDTO): Promise<WorkOrderWithRelations> {
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

    if (input.appointmentId && this.appointmentsRepository) {
      const appointment = await this.appointmentsRepository.findById(input.appointmentId);
      if (!appointment) {
        throw new NotFoundError(`Agendamento com ID ${input.appointmentId} não foi localizado.`);
      }

      if (appointment.clientId !== input.clientId) {
        throw new ConflictError("O agendamento informado pertence a outro cliente.");
      }

      if (appointment.vehiclePlate !== vehicle.plate) {
        throw new ConflictError("O agendamento informado pertence a outro veículo.");
      }
    }

    const uniqueServiceIds = Array.from(new Set(input.serviceIds));
    const itemsPersistence = [];

    for (const serviceId of uniqueServiceIds) {
      const service = await this.servicesRepository.findById(serviceId);
      if (!service) {
        throw new NotFoundError(`Serviço com ID ${serviceId} não foi localizado.`);
      }

      if (!service.active) {
        throw new ConflictError(`O serviço "${service.name}" está inativo no catálogo de serviços.`);
      }

      const priceRecord = await this.servicesRepository.getPriceForCategory(
        serviceId,
        vehicle.category as VehicleCategory
      );

      if (!priceRecord) {
        throw new NotFoundError(
          `Preço não configurado para a categoria ${vehicle.category} no serviço "${service.name}".`
        );
      }

      itemsPersistence.push({
        serviceId: service.id,
        serviceName: service.name,
        unitPriceInCents: priceRecord.priceInCents,
        quantity: 1,
        totalPriceInCents: priceRecord.priceInCents
      });
    }

    const sequence = await this.workOrdersRepository.getNextOrderSequence();
    const orderNumber = `OS-${String(sequence).padStart(5, "0")}`;

    const created = await this.workOrdersRepository.create({
      orderNumber,
      appointmentId: input.appointmentId,
      clientId: input.clientId,
      vehiclePlate: vehicle.plate,
      boxId: input.boxId,
      notes: input.notes ? input.notes.trim() : undefined,
      items: itemsPersistence
    });

    if (input.appointmentId && this.appointmentsRepository) {
      await this.appointmentsRepository.updateStatus(
        input.appointmentId,
        "COMPLETED",
        undefined,
        `Ordem de Serviço ${orderNumber} iniciada no pátio.`
      );
    }

    return created;
  }

  async getWorkOrderById(id: number): Promise<WorkOrderWithRelations> {
    const workOrder = await this.workOrdersRepository.findById(id);

    if (!workOrder) {
      throw new NotFoundError(`Ordem de Serviço com ID ${id} não foi localizada.`);
    }

    return workOrder;
  }

  async listWorkOrders(params: WorkOrderFilterParams): Promise<PaginatedWorkOrdersOutput> {
    return this.workOrdersRepository.list(params);
  }

  async updateWorkOrderStatus(
    id: number,
    input: UpdateWorkOrderStatusDTO
  ): Promise<WorkOrderWithRelations> {
    const workOrder = await this.workOrdersRepository.findById(id);

    if (!workOrder) {
      throw new NotFoundError(`Ordem de Serviço com ID ${id} não foi localizada.`);
    }

    if (workOrder.status === "DELIVERED") {
      throw new ConflictError(
        "Não é permitido alterar o status de uma Ordem de Serviço que já foi entregue ao cliente."
      );
    }

    if (workOrder.status === "CANCELLED") {
      throw new ConflictError("Não é permitido alterar o status de uma Ordem de Serviço cancelada.");
    }

    if (input.status === "CANCELLED" && (!input.cancellationReason || input.cancellationReason.trim().length < 3)) {
      throw new ConflictError("Motivo do cancelamento é obrigatório ao cancelar a Ordem de Serviço.");
    }

    const updated = await this.workOrdersRepository.updateStatus(
      id,
      input.status,
      input.cancellationReason ? input.cancellationReason.trim() : undefined,
      input.notes ? input.notes.trim() : undefined
    );

    if (!updated) {
      throw new NotFoundError(`Ordem de Serviço com ID ${id} não foi localizada.`);
    }

    if (this.notificationsService && updated.client?.phone) {
      const model = updated.vehicle?.model ? `${updated.vehicle.brand} ${updated.vehicle.model}` : "Veículo";
      const boxName = updated.box?.name || "Box";

      if (input.status === "IN_PROGRESS") {
        const content = `Olá, ${updated.client.fullName}! 🧼\nSeu veículo ${model} (${updated.vehiclePlate}) acabou de entrar no ${boxName} e nossa equipe já iniciou os serviços.\nAvisaremos assim que estiver pronto!`;
        await this.notificationsService
          .enqueueAutomaticNotification({
            type: "WORK_ORDER_STARTED",
            channel: "WHATSAPP",
            recipientPhone: updated.client.phone,
            recipientName: updated.client.fullName,
            content,
            clientId: updated.clientId,
            vehiclePlate: updated.vehiclePlate,
            workOrderId: updated.id,
            appointmentId: updated.appointmentId || undefined
          })
          .catch((err) => {
            process.stderr.write(`Falha ao enfileirar notificação WORK_ORDER_STARTED: ${err.message}\n`);
          });
      } else if (input.status === "READY_FOR_PICKUP") {
        const servicesList = updated.items
          .map((item) => `• ${item.serviceName} (${item.formattedTotalPrice})`)
          .join("\n");
        const content = `Olá, ${updated.client.fullName}! ✨🚗 Seu carro está pronto e brilhando no pátio do Bruno Lava Car!\n\n📋 *Serviços realizados:*\n${servicesList}\n💰 *Total:* ${updated.formattedTotalPrice}\n\n🔑 *Chave PIX para pagamento antecipado:*\n\`${env.PIX_KEY}\`\n(Também aceitamos cartão e dinheiro no local)\n\nAguardamos você para a retirada!`;
        await this.notificationsService
          .enqueueAutomaticNotification({
            type: "WORK_ORDER_READY",
            channel: "WHATSAPP",
            recipientPhone: updated.client.phone,
            recipientName: updated.client.fullName,
            content,
            clientId: updated.clientId,
            vehiclePlate: updated.vehiclePlate,
            workOrderId: updated.id,
            appointmentId: updated.appointmentId || undefined
          })
          .catch((err) => {
            process.stderr.write(`Falha ao enfileirar notificação WORK_ORDER_READY: ${err.message}\n`);
          });
      } else if (input.status === "DELIVERED") {
        const content = `Olá, ${updated.client.fullName}! Muito obrigado pela confiança no Bruno Lava Car! 🌟\nSeu veículo foi entregue. Esperamos vê-lo novamente em breve para manter seu carro sempre impecável!`;
        await this.notificationsService
          .enqueueAutomaticNotification({
            type: "WORK_ORDER_DELIVERED",
            channel: "WHATSAPP",
            recipientPhone: updated.client.phone,
            recipientName: updated.client.fullName,
            content,
            clientId: updated.clientId,
            vehiclePlate: updated.vehiclePlate,
            workOrderId: updated.id,
            appointmentId: updated.appointmentId || undefined
          })
          .catch((err) => {
            process.stderr.write(`Falha ao enfileirar notificação WORK_ORDER_DELIVERED: ${err.message}\n`);
          });
      }
    }

    return updated;
  }

  async addWorkOrderItem(
    workOrderId: number,
    input: AddWorkOrderItemDTO
  ): Promise<WorkOrderWithRelations> {
    const workOrder = await this.workOrdersRepository.findById(workOrderId);

    if (!workOrder) {
      throw new NotFoundError(`Ordem de Serviço com ID ${workOrderId} não foi localizada.`);
    }

    if (workOrder.status === "DELIVERED" || workOrder.status === "CANCELLED") {
      throw new ConflictError(
        `Não é possível adicionar serviços a uma Ordem de Serviço com status ${workOrder.status}.`
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
      workOrder.vehicle.category as VehicleCategory
    );

    if (!priceRecord) {
      throw new NotFoundError(
        `Preço não configurado para a categoria ${workOrder.vehicle.category} no serviço "${service.name}".`
      );
    }

    const quantity = input.quantity || 1;
    const unitPriceInCents = priceRecord.priceInCents;
    const totalPriceInCents = unitPriceInCents * quantity;

    const updated = await this.workOrdersRepository.addItem(workOrderId, {
      serviceId: service.id,
      serviceName: service.name,
      unitPriceInCents,
      quantity,
      totalPriceInCents
    });

    if (!updated) {
      throw new NotFoundError(`Ordem de Serviço com ID ${workOrderId} não foi localizada.`);
    }

    return updated;
  }

  async removeWorkOrderItem(workOrderId: number, itemId: number): Promise<WorkOrderWithRelations> {
    const workOrder = await this.workOrdersRepository.findById(workOrderId);

    if (!workOrder) {
      throw new NotFoundError(`Ordem de Serviço com ID ${workOrderId} não foi localizada.`);
    }

    if (workOrder.status === "DELIVERED" || workOrder.status === "CANCELLED") {
      throw new ConflictError(
        `Não é possível remover serviços de uma Ordem de Serviço com status ${workOrder.status}.`
      );
    }

    if (workOrder.items.length <= 1) {
      throw new ConflictError(
        "A Ordem de Serviço deve conter ao menos um serviço. Para encerrar o atendimento sem execução, altere o status para CANCELLED."
      );
    }

    const updated = await this.workOrdersRepository.removeItem(workOrderId, itemId);

    if (!updated) {
      throw new NotFoundError(
        `Item com ID ${itemId} não foi localizado na Ordem de Serviço ${workOrderId}.`
      );
    }

    return updated;
  }

  async getWorkOrderHistory(id: number): Promise<WorkOrderHistoryRecord[]> {
    const workOrder = await this.workOrdersRepository.findById(id);

    if (!workOrder) {
      throw new NotFoundError(`Ordem de Serviço com ID ${id} não foi localizada.`);
    }

    return this.workOrdersRepository.getHistory(id);
  }

  async listClientWorkOrders(
    clientId: number,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedWorkOrdersOutput> {
    const client = await this.clientsRepository.findById(clientId);

    if (!client) {
      throw new NotFoundError(`Cliente com ID ${clientId} não foi localizado.`);
    }

    return this.workOrdersRepository.listByClient(clientId, params);
  }

  async listVehicleWorkOrders(
    vehiclePlate: string,
    params: { page?: number; limit?: number }
  ): Promise<PaginatedWorkOrdersOutput> {
    const vehicle = await this.vehiclesRepository.findByPlate(vehiclePlate);

    if (!vehicle) {
      throw new NotFoundError(`Veículo com placa "${vehiclePlate}" não foi localizado.`);
    }

    return this.workOrdersRepository.listByVehicle(vehiclePlate, params);
  }
}
