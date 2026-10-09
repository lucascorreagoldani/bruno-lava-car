import type {
  SendWhatsAppMessageInput,
  SendWhatsAppMessageResult,
  WhatsAppProvider
} from "./whatsapp-provider.contract.js";

export class WebhookWhatsAppProvider implements WhatsAppProvider {
  constructor(
    private readonly apiUrl: string,
    private readonly apiToken?: string
  ) { }

  public async sendMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (this.apiToken) {
        headers.Authorization = `Bearer ${this.apiToken}`;
        headers.apikey = this.apiToken;
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: input.phone,
          name: input.name,
          message: input.message
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          errorMessage: `Erro HTTP ${response.status}: ${errorText}`
        };
      }

      const responseData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const providerMessageId =
        typeof responseData.id === "string"
          ? responseData.id
          : typeof responseData.messageId === "string"
            ? responseData.messageId
            : undefined;

      return {
        success: true,
        providerMessageId
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha na comunicação com o gateway WhatsApp";
      return {
        success: false,
        errorMessage: message
      };
    }
  }
}
