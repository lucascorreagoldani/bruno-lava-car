---
name: lava-car-domain
description: >-
  Use this skill whenever developing features, data models, business rules, pricing logic,
  or workflows specifically related to the Bruno Lava Car domain (services, vehicles, appointments, work orders, boxes, and notifications).
---

# Regras de Negócio e Domínio - Bruno Lava Car

## 1. Categorias de Veículos e Precificação
Os serviços e tempos de execução variam conforme a categoria do veículo:
- `HATCH_COMPACTO`: Veículos de pequeno porte (ex.: Onix, Polo, Gol, Kwid).
- `SEDAN_MEDIO`: Veículos de médio porte (ex.: Corolla, Civic, Virtus).
- `SUV_CROSSOVER`: Utilitários esportivos (ex.: Compass, Creta, T-Cross).
- `PICKUP_GRANDE`: Caminhonetes e vans (ex.: Hilux, Ranger, Toro, Sprinter).
- `MOTO`: Motocicletas e scooters.

## 2. Catálogo de Serviços
- **Lavagem Simples**: Ducha de alta pressão, lavagem com shampoo neutro, secagem e aspiração interna básica. (Duração média: 45 min).
- **Lavagem Completa**: Lavagem simples + chassi, caixa de rodas, motor, cera líquida e pretinho nos pneus. (Duração média: 90 min).
- **Higienização Interna**: Limpeza profunda de estofados (ou hidratação de couro), teto, carpetes e higienização do ar-condicionado. (Duração média: 180 min).
- **Detalhamento / Estética**:
  - Polimento Comercial e Técnico.
  - Vitrificação de Pintura (proteção cerâmica de 1 a 3 anos).
  - Descontaminação de Pintura e Remoção de Chuva Ácida dos Vidros.

## 3. Máquina de Estados da Ordem de Serviço (OS)
O ciclo de vida de um atendimento no Bruno Lava Car segue os seguintes estados estritos:
1. `AGENDADO`: Cliente reservou data, hora e box.
2. `CHECK_IN`: Veículo chegou ao lava-rápido. Realiza-se o checklist visual de avarias pré-existentes (arranhões, amassados, pertences deixados no interior).
3. `EM_LAVAGEM`: Veículo posicionado no box e equipe executando os serviços contratados.
4. `SECAGEM_ACABAMENTO`: Veículo em processo de detalhamento fino, pretinho e aspiração.
5. `PRONTO_RETIRADA`: Serviços concluídos. Disparo automático de notificação via WhatsApp ao cliente com resumo dos serviços e chave PIX/link de pagamento.
6. `ENTREGUE`: Veículo retirado pelo cliente e pagamento liquidado.
7. `CANCELADO`: Agendamento cancelado com liberação imediata do box no sistema.

## 4. Controle de Concorrência de Boxes e Capacidade
- O lava-rápido opera com um número fixo de boxes de lavagem simultâneos (`Box 1`, `Box 2`, `Box Detalhamento`).
- Agendamentos para o mesmo box e horário devem obrigatoriamente disputar um lock transacional no Redis para evitar sobreposição (overbooking).
- Notificações de confirmação de agendamento e status "Pronto para Retirada" devem ser enfileiradas no BullMQ para envio resiliente via webhook/WhatsApp.
