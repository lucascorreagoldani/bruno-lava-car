import { env } from "../../config/env.js";
import { MockWhatsAppProvider } from "./mock-whatsapp-provider.js";
import { WebhookWhatsAppProvider } from "./webhook-whatsapp-provider.js";
import type { WhatsAppProvider } from "./whatsapp-provider.contract.js";

export class WhatsAppProviderFactory {
  public static create(): WhatsAppProvider {
    if (env.WHATSAPP_DRIVER !== "mock" && env.WHATSAPP_API_URL) {
      return new WebhookWhatsAppProvider(env.WHATSAPP_API_URL, env.WHATSAPP_API_TOKEN);
    }

    return new MockWhatsAppProvider();
  }
}
