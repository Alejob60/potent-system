export enum ChannelType {
  WEB = 'web',
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  MESSENGER = 'messenger',
  EMAIL = 'email',
  API = 'api',
}

export interface IncomingMessage {
  senderId: string;
  tenantId?: string;
  content: string;
  metadata?: any;
}

export interface OutgoingMessage {
  recipientId: string;
  content: string;
  metadata?: any;
}

export interface ChannelAdapter {
  type: ChannelType;
  sendMessage(message: OutgoingMessage): Promise<any>;
  handleWebhook(payload: any): Promise<IncomingMessage[]>;
  verifyWebhook?(params: any): any;
}
