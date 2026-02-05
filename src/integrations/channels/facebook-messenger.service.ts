import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChannelAdapter, ChannelType, IncomingMessage, OutgoingMessage } from './channel-adapter.interface';

@Injectable()
export class FacebookMessengerService implements ChannelAdapter {
  private readonly logger = new Logger(FacebookMessengerService.name);
  readonly type = ChannelType.MESSENGER;
  private readonly baseUrl: string;
  private readonly pageAccessToken: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.FACEBOOK_BASE_URL || 'https://graph.facebook.com/v17.0';
    this.pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
  }

  async sendMessage(message: OutgoingMessage): Promise<any> {
    return this.sendTextMessage(message.recipientId, message.content);
  }

  async handleWebhook(payload: any): Promise<IncomingMessage[]> {
    const messages: IncomingMessage[] = [];
    if (payload.entry && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const msg of entry.messaging) {
            if (msg.message) {
              messages.push({
                senderId: msg.sender?.id,
                content: msg.message.text || '',
                metadata: msg
              });
            }
          }
        }
      }
    }
    return messages;
  }

  /**
   * Send a text message through Facebook Messenger
   * @param recipientId Recipient Facebook user ID
   * @param message Text message to send
   * @returns Response from Facebook API
   */
  async sendTextMessage(recipientId: string, message: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/me/messages`;
      const payload = {
        recipient: {
          id: recipientId,
        },
        message: {
          text: message,
        },
      };

      const params = {
        access_token: this.pageAccessToken,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { params })
      );

      this.logger.log(`Successfully sent message to user ${recipientId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send message to user ${recipientId}: ${error.message}`);
      throw new Error(`Failed to send Facebook Messenger message: ${error.message}`);
    }
  }

  /**
   * Send a template message through Facebook Messenger
   * @param recipientId Recipient Facebook user ID
   * @param templatePayload Template payload
   * @returns Response from Facebook API
   */
  async sendTemplateMessage(recipientId: string, templatePayload: any): Promise<any> {
    try {
      const url = `${this.baseUrl}/me/messages`;
      const payload = {
        recipient: {
          id: recipientId,
        },
        message: templatePayload,
      };

      const params = {
        access_token: this.pageAccessToken,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { params })
      );

      this.logger.log(`Successfully sent template message to user ${recipientId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send template message to user ${recipientId}: ${error.message}`);
      throw new Error(`Failed to send Facebook Messenger template message: ${error.message}`);
    }
  }

  /**
   * Send a quick reply message through Facebook Messenger
   * @param recipientId Recipient Facebook user ID
   * @param text Text message
   * @param quickReplies Array of quick reply objects
   * @returns Response from Facebook API
   */
  async sendQuickReplyMessage(
    recipientId: string,
    text: string,
    quickReplies: any[]
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/me/messages`;
      const payload = {
        recipient: {
          id: recipientId,
        },
        message: {
          text: text,
          quick_replies: quickReplies,
        },
      };

      const params = {
        access_token: this.pageAccessToken,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { params })
      );

      this.logger.log(`Successfully sent quick reply message to user ${recipientId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send quick reply message to user ${recipientId}: ${error.message}`);
      throw new Error(`Failed to send Facebook Messenger quick reply message: ${error.message}`);
    }
  }

  /**
   * Handle incoming webhook events from Facebook Messenger
   * @param payload Webhook payload from Facebook
   * @returns Processed event data
   */
  async handleWebhookEvent(payload: any): Promise<any> {
    try {
      // Process different types of webhook events
      if (payload.entry && Array.isArray(payload.entry)) {
        for (const entry of payload.entry) {
          if (entry.messaging && Array.isArray(entry.messaging)) {
            for (const message of entry.messaging) {
              // Handle message events
              await this.processMessageEvent(message);
            }
          }
        }
      }

      this.logger.log('Successfully processed Facebook Messenger webhook event');
      return { success: true, message: 'Webhook event processed' };
    } catch (error) {
      this.logger.error(`Failed to process Facebook Messenger webhook event: ${error.message}`);
      throw new Error(`Failed to process Facebook Messenger webhook event: ${error.message}`);
    }
  }

  /**
   * Process individual message events
   * @param messageData Message data from webhook
   */
  private async processMessageEvent(messageData: any): Promise<void> {
    try {
      // Check if this is a message event
      if (messageData.message) {
        const senderId = messageData.sender?.id;
        const message = messageData.message;
        
        this.logger.log(`Processing message from user ${senderId}`);
        
        // Here you would typically:
        // 1. Save the message to database
        // 2. Trigger appropriate business logic
        // 3. Send response if needed
        // 4. Update conversation context
        
        // For now, we'll just log the message
        this.logger.debug(`Received message: ${JSON.stringify(message)}`);
      }
      // Handle other event types (delivery, read, postback, etc.)
      else if (messageData.delivery) {
        this.logger.log('Processing delivery confirmation');
      }
      else if (messageData.read) {
        this.logger.log('Processing read confirmation');
      }
      else if (messageData.postback) {
        this.logger.log('Processing postback event');
        await this.processPostbackEvent(messageData.postback);
      }
    } catch (error) {
      this.logger.error(`Failed to process message event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process postback events
   * @param postbackData Postback data from webhook
   */
  private async processPostbackEvent(postbackData: any): Promise<void> {
    try {
      const payload = postbackData.payload;
      this.logger.log(`Processing postback with payload: ${payload}`);
      
      // Here you would typically:
      // 1. Parse the payload to determine the action
      // 2. Trigger appropriate business logic
      // 3. Send response if needed
      
      // For now, we'll just log the postback
      this.logger.debug(`Received postback: ${JSON.stringify(postbackData)}`);
    } catch (error) {
      this.logger.error(`Failed to process postback event: ${error.message}`);
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
    const expectedToken = process.env.FACEBOOK_VERIFY_TOKEN || 'default_verify_token';
    
    if (token === expectedToken) {
      this.logger.log('Facebook Messenger webhook verification successful');
      return challenge;
    } else {
      this.logger.warn('Facebook Messenger webhook verification failed');
      throw new Error('Verification failed');
    }
  }

  /**
   * Mark message as seen
   * @param recipientId Recipient Facebook user ID
   * @returns Response from Facebook API
   */
  async markSeen(recipientId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/me/messages`;
      const payload = {
        recipient: {
          id: recipientId,
        },
        sender_action: 'MARK_SEEN',
      };

      const params = {
        access_token: this.pageAccessToken,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { params })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to mark message as seen for user ${recipientId}: ${error.message}`);
      throw new Error(`Failed to mark message as seen: ${error.message}`);
    }
  }

  /**
   * Send typing indicators
   * @param recipientId Recipient Facebook user ID
   * @param action Typing action (MARK_SEEN, TYPING_ON, TYPING_OFF)
   * @returns Response from Facebook API
   */
  async sendSenderAction(recipientId: string, action: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/me/messages`;
      const payload = {
        recipient: {
          id: recipientId,
        },
        sender_action: action,
      };

      const params = {
        access_token: this.pageAccessToken,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { params })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send sender action ${action} for user ${recipientId}: ${error.message}`);
      throw new Error(`Failed to send sender action: ${error.message}`);
    }
  }
}