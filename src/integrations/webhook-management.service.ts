import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebhookManagementService {
  private readonly logger = new Logger(WebhookManagementService.name);
  private readonly webhookSubscriptions: Map<string, any> = new Map();
  private readonly webhookEvents: Map<string, any[]> = new Map();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Register a webhook subscription
   * @param channelId Unique identifier for the channel
   * @param webhookUrl URL where webhook events should be sent
   * @param events Array of events to subscribe to
   * @param secret Optional secret for webhook verification
   * @returns Registration result
   */
  async registerWebhook(
    channelId: string,
    webhookUrl: string,
    events: string[],
    secret?: string,
  ): Promise<any> {
    try {
      const subscription = {
        channelId,
        webhookUrl,
        events,
        secret,
        createdAt: new Date(),
        active: true,
      };

      this.webhookSubscriptions.set(channelId, subscription);
      
      // Initialize event storage for this channel
      if (!this.webhookEvents.has(channelId)) {
        this.webhookEvents.set(channelId, []);
      }

      this.logger.log(`Registered webhook for channel ${channelId}`);
      return {
        success: true,
        channelId,
        message: 'Webhook registered successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to register webhook for channel ${channelId}: ${error.message}`);
      throw new Error(`Failed to register webhook: ${error.message}`);
    }
  }

  /**
   * Unregister a webhook subscription
   * @param channelId Unique identifier for the channel
   * @returns Unregistration result
   */
  async unregisterWebhook(channelId: string): Promise<any> {
    try {
      const subscription = this.webhookSubscriptions.get(channelId);
      
      if (!subscription) {
        throw new Error(`No webhook subscription found for channel ${channelId}`);
      }

      subscription.active = false;
      this.webhookSubscriptions.set(channelId, subscription);

      this.logger.log(`Unregistered webhook for channel ${channelId}`);
      return {
        success: true,
        channelId,
        message: 'Webhook unregistered successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to unregister webhook for channel ${channelId}: ${error.message}`);
      throw new Error(`Failed to unregister webhook: ${error.message}`);
    }
  }

  /**
   * Process an incoming webhook event
   * @param channelId Unique identifier for the channel
   * @param event Event data
   * @returns Processing result
   */
  async processWebhookEvent(channelId: string, event: any): Promise<any> {
    try {
      const subscription = this.webhookSubscriptions.get(channelId);
      
      if (!subscription || !subscription.active) {
        throw new Error(`No active webhook subscription found for channel ${channelId}`);
      }

      // Check if we should process this event type
      if (!subscription.events.includes(event.type) && !subscription.events.includes('*')) {
        this.logger.log(`Event type ${event.type} not subscribed for channel ${channelId}`);
        return {
          success: true,
          message: 'Event not subscribed, ignoring',
        };
      }

      // Store the event for potential replay
      const events = this.webhookEvents.get(channelId) || [];
      events.push({
        ...event,
        processedAt: new Date(),
        id: this.generateEventId(),
      });
      this.webhookEvents.set(channelId, events);

      // Send the webhook to the registered URL
      const result = await this.sendWebhook(subscription.webhookUrl, event, subscription.secret);

      this.logger.log(`Processed webhook event for channel ${channelId}`);
      return {
        success: true,
        result,
        message: 'Webhook event processed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to process webhook event for channel ${channelId}: ${error.message}`);
      
      // Store failed events for potential replay
      const events = this.webhookEvents.get(channelId) || [];
      events.push({
        ...event,
        processedAt: new Date(),
        id: this.generateEventId(),
        failed: true,
        error: error.message,
      });
      this.webhookEvents.set(channelId, events);
      
      throw new Error(`Failed to process webhook event: ${error.message}`);
    }
  }

  /**
   * Replay a webhook event
   * @param channelId Unique identifier for the channel
   * @param eventId Event ID to replay
   * @returns Replay result
   */
  async replayWebhookEvent(channelId: string, eventId: string): Promise<any> {
    try {
      const events = this.webhookEvents.get(channelId) || [];
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} not found for channel ${channelId}`);
      }

      const subscription = this.webhookSubscriptions.get(channelId);
      
      if (!subscription || !subscription.active) {
        throw new Error(`No active webhook subscription found for channel ${channelId}`);
      }

      // Send the webhook to the registered URL
      const result = await this.sendWebhook(subscription.webhookUrl, event, subscription.secret);

      this.logger.log(`Replayed webhook event ${eventId} for channel ${channelId}`);
      return {
        success: true,
        result,
        message: 'Webhook event replayed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to replay webhook event ${eventId} for channel ${channelId}: ${error.message}`);
      throw new Error(`Failed to replay webhook event: ${error.message}`);
    }
  }

  /**
   * Get webhook subscription information
   * @param channelId Unique identifier for the channel
   * @returns Subscription information
   */
  getWebhookSubscription(channelId: string): any {
    const subscription = this.webhookSubscriptions.get(channelId);
    
    if (!subscription) {
      return null;
    }

    return {
      ...subscription,
      eventsCount: (this.webhookEvents.get(channelId) || []).length,
    };
  }

  /**
   * Get recent webhook events for a channel
   * @param channelId Unique identifier for the channel
   * @param limit Maximum number of events to return
   * @returns Array of recent events
   */
  getRecentWebhookEvents(channelId: string, limit: number = 10): any[] {
    const events = this.webhookEvents.get(channelId) || [];
    return events.slice(-limit).reverse();
  }

  /**
   * Send a webhook to the registered URL
   * @param url Webhook URL
   * @param payload Event payload
   * @param secret Optional secret for signature
   * @returns HTTP response
   */
  private async sendWebhook(url: string, payload: any, secret?: string): Promise<any> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      // Add signature if secret is provided
      if (secret) {
        const signature = this.generateSignature(payload, secret);
        headers['X-Hub-Signature'] = `sha256=${signature}`;
      }

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send webhook to ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a signature for webhook verification
   * @param payload Event payload
   * @param secret Secret key
   * @returns HMAC signature
   */
  private generateSignature(payload: any, secret: string): string {
    const crypto = require('crypto');
    const payloadString = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  /**
   * Generate a unique event ID
   * @returns Unique event ID
   */
  private generateEventId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}