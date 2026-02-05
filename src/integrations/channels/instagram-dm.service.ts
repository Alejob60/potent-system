import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChannelAdapter, ChannelType, IncomingMessage, OutgoingMessage } from './channel-adapter.interface';

@Injectable()
export class InstagramDmService implements ChannelAdapter {
  private readonly logger = new Logger(InstagramDmService.name);
  readonly type = ChannelType.INSTAGRAM;
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly instagramBusinessAccountId: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.INSTAGRAM_BASE_URL || 'https://graph.facebook.com/v17.0';
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
    this.instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '';
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
   * Send a text message through Instagram DM
   * @param recipientId Recipient Instagram user ID
   * @param message Text message to send
   * @returns Response from Instagram API
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

      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers })
      );

      this.logger.log(`Successfully sent DM to user ${recipientId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send DM to user ${recipientId}: ${error.message}`);
      throw new Error(`Failed to send Instagram DM: ${error.message}`);
    }
  }

  /**
   * Send a media message through Instagram DM
   * @param recipientId Recipient Instagram user ID
   * @param mediaType Type of media (image, video, etc.)
   * @param mediaUrl URL of the media
   * @param caption Optional caption for the media
   * @returns Response from Instagram API
   */
  async sendMediaMessage(
    recipientId: string,
    mediaType: string,
    mediaUrl: string,
    caption?: string
  ): Promise<any> {
    try {
      const url = `${this.baseUrl}/me/messages`;
      const payload = {
        recipient: {
          id: recipientId,
        },
        message: {
          attachment: {
            type: mediaType,
            payload: {
              url: mediaUrl,
              is_reusable: true,
            },
          },
        },
      };

      // Add caption if provided
      if (caption) {
        payload.message.attachment.payload['caption'] = caption;
      }

      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers })
      );

      this.logger.log(`Successfully sent media DM to user ${recipientId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send media DM to user ${recipientId}: ${error.message}`);
      throw new Error(`Failed to send Instagram media DM: ${error.message}`);
    }
  }

  /**
   * Handle incoming webhook events from Instagram
   * @param payload Webhook payload from Instagram
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

      this.logger.log('Successfully processed Instagram webhook event');
      return { success: true, message: 'Webhook event processed' };
    } catch (error) {
      this.logger.error(`Failed to process Instagram webhook event: ${error.message}`);
      throw new Error(`Failed to process Instagram webhook event: ${error.message}`);
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
        
        this.logger.log(`Processing DM from user ${senderId}`);
        
        // Here you would typically:
        // 1. Save the message to database
        // 2. Trigger appropriate business logic
        // 3. Send response if needed
        // 4. Update conversation context
        
        // For now, we'll just log the message
        this.logger.debug(`Received DM: ${JSON.stringify(message)}`);
      }
      // Handle other event types (delivery, read, etc.)
      else if (messageData.delivery) {
        this.logger.log('Processing delivery confirmation');
      }
      else if (messageData.read) {
        this.logger.log('Processing read confirmation');
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
    const expectedToken = process.env.INSTAGRAM_VERIFY_TOKEN || 'default_verify_token';
    
    if (token === expectedToken) {
      this.logger.log('Instagram webhook verification successful');
      return challenge;
    } else {
      this.logger.warn('Instagram webhook verification failed');
      throw new Error('Verification failed');
    }
  }

  /**
   * Get user profile information
   * @param userId Instagram user ID
   * @returns User profile information
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/${userId}`;
      const params = {
        access_token: this.accessToken,
        fields: 'id,name,profile_pic',
      };

      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user profile for ${userId}: ${error.message}`);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }
}