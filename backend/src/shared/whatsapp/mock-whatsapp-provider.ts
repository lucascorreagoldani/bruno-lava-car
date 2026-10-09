import crypto from "node:crypto";
import type {
  SendWhatsAppMessageInput,
  SendWhatsAppMessageResult,
  WhatsAppProvider
} from "./whatsapp-provider.contract.js";

export class MockWhatsAppProvider implements WhatsAppProvider {
  public async sendMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult> {
    const simulatedMessageId = `mock_msg_${crypto.randomUUID()}`;
    process.stdout.write(
      `[MockWhatsApp] Mensagem simulada enviada para ${input.name} (${input.phone}): ID ${simulatedMessageId}\n`
    );

    return {
      success: true,
      providerMessageId: simulatedMessageId
    };
  }
}
