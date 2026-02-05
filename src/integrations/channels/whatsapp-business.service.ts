import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChannelAdapter, ChannelType, IncomingMessage, OutgoingMessage } from './channel-adapter.interface';

@Injectable()
export class WhatsappBusinessService implements ChannelAdapter {
  private readonly logger = new Logger(WhatsappBusinessService.name);
  readonly type = ChannelType.WHATSAPP;
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com/v17.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage(message: OutgoingMessage): Promise<any> {
    return this.sendTextMessage(message.recipientId, message.content);
  }

  async handleWebhook(payload: any): Promise<IncomingMessage[]> {
    const messages: IncomingMessage[] = [];
    if (payload.entry && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value.messages) {
              for (const msg of change.value.messages) {
                messages.push({
                  senderId: msg.from,
                  content: msg.text?.body || '',
                  metadata: msg
                });
              }
            }
          }
        }
      }
    }
    return messages;
  }

  /**
   * Send a text message through WhatsApp Business API
   * @param to Recipient phone number
   * @param message Text message to send
   * @returns Response from WhatsApp API
   */
  async sendTextMessage(to: string, message: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to,
        text: {
          body: message,
        },
      };

      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers })
      );

      this.logger.log(`Successfully sent message to ${to}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send message to ${to}: ${error.message}`);
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }
  }

  /**
   * Send a template message through WhatsApp Business API
   * @param to Recipient phone number
   * @param templateName Name of the template to send
   * @param language Language code for the template
   * @param components Template components
   * @returns Response from WhatsApp API
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string,
    components: any[]
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language,
          },
          components,
        },
      };

      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers })
      );

      this.logger.log(`Successfully sent template message to ${to}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send template message to ${to}: ${error.message}`);
      throw new Error(`Failed to send WhatsApp template message: ${error.message}`);
    }
  }

  /**
   * Handle incoming webhook events from WhatsApp
   * @param payload Webhook payload from WhatsApp
   * @returns Processed event data
   */
  async handleWebhookEvent(payload: any): Promise<any> {
    try {
      // Process different types of webhook events
      if (payload.entry && Array.isArray(payload.entry)) {
        for (const entry of payload.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              if (change.field === 'messages') {
                // Handle message events
                await this.processMessageEvent(change.value);
              }
            }
          }
        }
      }

      this.logger.log('Successfully processed webhook event');
      return { success: true, message: 'Webhook event processed' };
    } catch (error) {
      this.logger.error(`Failed to process webhook event: ${error.message}`);
      throw new Error(`Failed to process webhook event: ${error.message}`);
    }
  }

  /**
   * Process individual message events
   * @param messageData Message data from webhook
   */
  private async processMessageEvent(messageData: any): Promise<void> {
    try {
      // Extract message information
      const { messages, contacts, metadata } = messageData;
      
      if (messages && Array.isArray(messages) && messages.length > 0) {
        const message = messages[0];
        const contact = contacts && Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : null;
        
        this.logger.log(`Processing message from ${contact?.profile?.name || message.from}`);
        
        // Here you would typically:
        // 1. Save the message to database
        // 2. Trigger appropriate business logic
        // 3. Send response if needed
        // 4. Update conversation context
        
        // For now, we'll just log the message
        this.logger.debug(`Received message: ${JSON.stringify(message)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process message event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify webhook subscription
   * @param params Verification parameters (token, challenge)
   * @returns Challenge response for verification
   */
  verifyWebhook(params: any): string {
    const { token, challenge } = params;
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'default_verify_token';
    
    if (token === expectedToken) {
      this.logger.log('Webhook verification successful');
      return challenge;
    } else {
      this.logger.warn('Webhook verification failed');
      throw new Error('Verification failed');
    }
  }
}