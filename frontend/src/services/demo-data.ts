import type { Box, WorkOrder } from "@/types/domain";

export const DEMO_BOXES: Box[] = [
  {
    id: 1,
    name: "Box 1 - Lavagem Rápida",
    status: "ACTIVE",
    description: "Ducha de alta pressão e aspiração",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Box 2 - Lavagem Geral",
    status: "ACTIVE",
    description: "Chassi, motor e cera",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Box 3 - Detalhamento & Estética",
    status: "ACTIVE",
    description: "Polimento e vitrificação",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEMO_WORK_ORDERS: WorkOrder[] = [
  {
    id: 101,
    clientId: 1,
    vehiclePlate: "BRA2E19",
    boxId: 1,
    status: "IN_PROGRESS",
    totalPrice: 9000,
    notes: "Atenção especial nas rodas",
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 1,
      name: "Carlos Eduardo Silva",
      phone: "(11) 98765-4321",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    vehicle: {
      plate: "BRA2E19",
      brand: "Chevrolet",
      model: "Onix Premier",
      color: "Preto",
      category: "HATCH_COMPACTO",
      clientId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    box: DEMO_BOXES[0],
    items: [
      {
        id: 1,
        workOrderId: 101,
        serviceId: 2,
        quantity: 1,
        unitPrice: 9000,
        totalPrice: 9000,
        service: {
          id: 2,
          name: "Lavagem Completa",
          durationMinutes: 90,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 102,
    clientId: 2,
    vehiclePlate: "QBC9921",
    boxId: 3,
    status: "FINISHING",
    totalPrice: 65000,
    notes: "Vitrificação 1 ano com proteção cerâmica",
    createdAt: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 2,
      name: "Mariana Souza",
      phone: "(11) 99123-8877",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    vehicle: {
      plate: "QBC9921",
      brand: "Jeep",
      model: "Compass Limited",
      color: "Cinza",
      category: "SUV_CROSSOVER",
      clientId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    box: DEMO_BOXES[2],
    items: [
      {
        id: 2,
        workOrderId: 102,
        serviceId: 4,
        quantity: 1,
        unitPrice: 65000,
        totalPrice: 65000,
        service: {
          id: 4,
          name: "Vitrificação Cerâmica",
          durationMinutes: 180,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 103,
    clientId: 3,
    vehiclePlate: "BRA3A11",
    boxId: 2,
    status: "CHECK_IN",
    totalPrice: 6000,
    notes: "Veículo aguardando posicionamento",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 3,
      name: "Felipe Almeida",
      phone: "(11) 97412-3322",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    vehicle: {
      plate: "BRA3A11",
      brand: "Honda",
      model: "Civic Touring",
      color: "Branco",
      category: "SEDAN_MEDIO",
      clientId: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    box: DEMO_BOXES[1],
    items: [
      {
        id: 3,
        workOrderId: 103,
        serviceId: 1,
        quantity: 1,
        unitPrice: 6000,
        totalPrice: 6000,
        service: {
          id: 1,
          name: "Lavagem Simples",
          durationMinutes: 45,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 104,
    clientId: 4,
    vehiclePlate: "KLP4019",
    boxId: 1,
    status: "READY_FOR_PICKUP",
    totalPrice: 45000,
    notes: "Cliente notificado via WhatsApp",
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 4,
      name: "Roberto Mendes",
      phone: "(11) 98877-6655",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    vehicle: {
      plate: "KLP4019",
      brand: "Toyota",
      model: "Hilux SRX",
      color: "Prata",
      category: "PICKUP_GRANDE",
      clientId: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    box: DEMO_BOXES[0],
    items: [
      {
        id: 4,
        workOrderId: 104,
        serviceId: 3,
        quantity: 1,
        unitPrice: 45000,
        totalPrice: 45000,
        service: {
          id: 3,
          name: "Polimento Comercial",
          durationMinutes: 120,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 105,
    clientId: 5,
    vehiclePlate: "ABC1234",
    boxId: 2,
    status: "DELIVERED",
    totalPrice: 8500,
    notes: "Entregue e pago via PIX",
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    client: {
      id: 5,
      name: "Juliana Castro",
      phone: "(11) 99554-1122",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    vehicle: {
      plate: "ABC1234",
      brand: "Volkswagen",
      model: "Polo Highline",
      color: "Azul",
      category: "HATCH_COMPACTO",
      clientId: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    box: DEMO_BOXES[1],
    items: [
      {
        id: 5,
        workOrderId: 105,
        serviceId: 2,
        quantity: 1,
        unitPrice: 8500,
        totalPrice: 8500,
        service: {
          id: 2,
          name: "Lavagem Completa",
          durationMinutes: 90,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      }
    ]
  }
];
