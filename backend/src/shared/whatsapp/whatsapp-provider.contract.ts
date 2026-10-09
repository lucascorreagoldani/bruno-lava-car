export interface SendWhatsAppMessageInput {
  phone: string;
  name: string;
  message: string;
}

export interface SendWhatsAppMessageResult {
  success: boolean;
  providerMessageId?: string;
  errorMessage?: string;
}

export interface WhatsAppProvider {
  sendMessage(input: SendWhatsAppMessageInput): Promise<SendWhatsAppMessageResult>;
}
