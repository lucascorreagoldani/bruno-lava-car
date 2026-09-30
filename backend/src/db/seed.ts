import { db, pool } from "./connection.js";
import { clients } from "./schema/clients.js";
import { vehicles } from "./schema/vehicles.js";
import { sanitizeAndValidatePhone } from "../shared/validators/phone-validator.js";
import { sanitizeAndValidatePlate } from "../shared/validators/plate-validator.js";

async function seedDatabase() {
  process.stdout.write("--> Iniciando inserção de dados de exemplo no banco...\n");

  try {
    const rawPhone = "(+55) 55 9 9655-8820";
    const sanitizedPhone = sanitizeAndValidatePhone(rawPhone);

    const [newClient] = await db.insert(clients).values({
      fullName: "Lucas Corrêa Goldani",
      phone: sanitizedPhone
    }).returning();

    if (!newClient) {
      throw new Error("Falha ao criar cliente.");
    }

    process.stdout.write(`Cliente criado com sucesso: ID ${newClient.id} - ${newClient.fullName} (${newClient.phone})\n`);

    const plate1 = sanitizeAndValidatePlate("BRA2E19");
    const [vehicle1] = await db.insert(vehicles).values({
      plate: plate1,
      clientId: newClient.id,
      brand: "Honda",
      model: "Civic G10",
      color: "Preto Cristal",
      year: 2021,
      category: "SEDAN"
    }).returning();

    process.stdout.write(`Veículo 1 vinculado ao cliente: Placa ${vehicle1?.plate} - ${vehicle1?.model}\n`);

    const plate2 = sanitizeAndValidatePlate("ABC-1234");
    const [vehicle2] = await db.insert(vehicles).values({
      plate: plate2,
      clientId: newClient.id,
      brand: "Toyota",
      model: "Hilux SRX",
      color: "Prata",
      year: 2023,
      category: "PICKUP"
    }).returning();

    process.stdout.write(`Veículo 2 vinculado ao mesmo cliente (1:N): Placa ${vehicle2?.plate} - ${vehicle2?.model}\n`);

    const result = await db.query.clients.findMany({
      with: {
        vehicles: true
      }
    });

    process.stdout.write(`Consulta relacional concluída com sucesso: ${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Erro no seed: ${error instanceof Error ? error.message : String(error)}\n`);
  } finally {
    await pool.end();
  }
}

seedDatabase();
