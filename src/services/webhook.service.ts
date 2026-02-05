import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface WebhookEvent {
  channel: string;
  eventType: string;
  payload: any;
  timestamp: Date;
  agentId?: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private webhookEvents: WebhookEvent[] = [];

  constructor(private readonly httpService: HttpService) {}

  /**
   * Process incoming webhook from Facebook
   * @param payload Webhook payload
   * @returns Processing result
   */
  async processFacebookWebhook(payload: any): Promise<any> {
    try {
      this.logger.log('Processing Facebook webhook event');
      
      const event: WebhookEvent = {
        channel: 'facebook',
        eventType: payload.object || 'unknown',
        payload,
        timestamp: new Date(),
      };

      this.webhookEvents.push(event);
      
      // In a real implementation, this would process the Facebook webhook
      // and potentially send it to the AI orchestrator
      return {
        success: true,
        message: 'Facebook webhook processed',
        eventId: `fb_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error('Failed to process Facebook webhook:', error.message);
      throw error;
    }
  }

  /**
   * Process incoming webhook from WhatsApp
   * @param payload Webhook payload
   * @returns Processing result
   */
  async processWhatsAppWebhook(payload: any): Promise<any> {
    try {
      this.logger.log('Processing WhatsApp webhook event');
      
      const event: WebhookEvent = {
        channel: 'whatsapp',
        eventType: payload.type || 'unknown',
        payload,
        timestamp: new Date(),
      };

      this.webhookEvents.push(event);
      
      // In a real implementation, this would process the WhatsApp webhook
      // and potentially send it to the AI orchestrator
      return {
        success: true,
        message: 'WhatsApp webhook processed',
        eventId: `wa_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error('Failed to process WhatsApp webhook:', error.message);
      throw error;
    }
  }

  /**
   * Process incoming webhook from Google Ads
   * @param payload Webhook payload
   * @returns Processing result
   */
  async processGoogleAdsWebhook(payload: any): Promise<any> {
    try {
      this.logger.log('Processing Google Ads webhook event');
      
      const event: WebhookEvent = {
        channel: 'google-ads',
        eventType: payload.eventType || 'unknown',
        payload,
        timestamp: new Date(),
      };

      this.webhookEvents.push(event);
      
      // In a real implementation, this would process the Google Ads webhook
      // and potentially send it to the AI orchestrator
      return {
        success: true,
        message: 'Google Ads webhook processed',
        eventId: `ga_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error('Failed to process Google Ads webhook:', error.message);
      throw error;
    }
  }

  /**
   * Verify webhook subscription for Facebook
   * @param verifyToken Verification token
   * @param challenge Challenge string
   * @returns Verification response
   */
  verifyFacebookWebhook(verifyToken: string, challenge: string): any {
    // In a real implementation, this would verify the token against stored values
    this.logger.log('Verifying Facebook webhook subscription');
    return { challenge };
  }

  /**
   * Get recent webhook events
   * @param limit Number of events to return
   * @returns Array of webhook events
   */
  getRecentWebhookEvents(limit: number = 50): WebhookEvent[] {
    return this.webhookEvents.slice(-limit);
  }

  /**
   * Get webhook events by channel
   * @param channel Channel name
   * @param limit Number of events to return
   * @returns Array of webhook events
   */
  getWebhookEventsByChannel(channel: string, limit: number = 50): WebhookEvent[] {
    const filteredEvents = this.webhookEvents.filter(event => event.channel === channel);
    return filteredEvents.slice(-limit);
  }
}