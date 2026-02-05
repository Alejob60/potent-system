import { Injectable, Logger } from '@nestjs/common';
import { ColombiaTICAgentService } from './colombiatic-agent.service';
import { WebhookService } from './webhook.service';
import { IAOrchestratorService } from './ia-orchestrator.service';

export interface ColombiaTICWebhookEvent {
  id: string;
  agentId: string;
  channel: string;
  eventType: string;
  payload: any;
  processed: boolean;
  response?: any;
  timestamp: Date;
}

export interface ChannelMessage {
  id: string;
  agentId: string;
  channel: string;
  content: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  processed: boolean;
  response?: any;
}

@Injectable()
export class ColombiaTICOrchestratorService {
  private readonly logger = new Logger(ColombiaTICOrchestratorService.name);
  private webhookEvents: ColombiaTICWebhookEvent[] = [];
  private channelMessages: ChannelMessage[] = [];

  constructor(
    private readonly agentService: ColombiaTICAgentService,
    private readonly webhookService: WebhookService,
    private readonly iaOrchestrator: IAOrchestratorService,
  ) {}

  /**
   * Process a webhook event from any channel
   * @param channel Channel name
   * @param eventType Event type
   * @param payload Event payload
   * @param agentId Associated agent ID
   * @returns Processing result
   */
  async processWebhookEvent(
    channel: string,
    eventType: string,
    payload: any,
    agentId?: string
  ): Promise<any> {
    try {
      this.logger.log(`Processing webhook event from ${channel}: ${eventType}`);

      // Create webhook event record
      const webhookEvent: ColombiaTICWebhookEvent = {
        id: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId: agentId || 'unknown',
        channel,
        eventType,
        payload,
        processed: false,
        timestamp: new Date(),
      };

      // Store the event
      this.webhookEvents.push(webhookEvent);

      // Process based on channel type
      let response: any;
      switch (channel) {
        case 'facebook':
          response = await this.processFacebookEvent(eventType, payload, agentId);
          break;
        case 'whatsapp':
          response = await this.processWhatsAppEvent(eventType, payload, agentId);
          break;
        case 'google-ads':
          response = await this.processGoogleAdsEvent(eventType, payload, agentId);
          break;
        default:
          response = await this.processGenericEvent(eventType, payload, agentId);
      }

      // Update event record
      webhookEvent.processed = true;
      webhookEvent.response = response;

      return {
        success: true,
        eventId: webhookEvent.id,
        response,
      };
    } catch (error) {
      this.logger.error(`Failed to process webhook event from ${channel}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process Facebook webhook event
   */
  private async processFacebookEvent(eventType: string, payload: any, agentId?: string): Promise<any> {
    try {
      // Extract message content if this is a message event
      if (eventType === 'message' && payload.entry) {
        for (const entry of payload.entry) {
          if (entry.messaging) {
            for (const messageEvent of entry.messaging) {
              if (messageEvent.message && messageEvent.message.text) {
                // Process the message through IA Orchestrator
                const sessionId = `fb_${entry.id}_${messageEvent.sender?.id || 'unknown'}`;
                const response = await this.iaOrchestrator.processMessage(
                  messageEvent.message.text,
                  sessionId,
                  entry.id,
                  'facebook'
                );

                // Store channel message
                const channelMessage: ChannelMessage = {
                  id: `msg_${Date.now()}`,
                  agentId: agentId || 'unknown',
                  channel: 'facebook',
                  content: messageEvent.message.text,
                  sender: 'user',
                  timestamp: new Date(),
                  processed: true,
                  response,
                };
                this.channelMessages.push(channelMessage);

                return response;
              }
            }
          }
        }
      }

      // For other event types, just log them
      this.logger.log(`Processed Facebook ${eventType} event`);
      return { message: `Facebook ${eventType} event processed` };
    } catch (error) {
      this.logger.error('Failed to process Facebook event:', error.message);
      throw error;
    }
  }

  /**
   * Process WhatsApp webhook event
   */
  private async processWhatsAppEvent(eventType: string, payload: any, agentId?: string): Promise<any> {
    try {
      // Extract message content if this is a message event
      if (payload.messages) {
        for (const message of payload.messages) {
          if (message.text && message.text.body) {
            // Process the message through IA Orchestrator
            const sessionId = `wa_${payload.contacts?.[0]?.wa_id || 'unknown'}_${message.from}`;
            const response = await this.iaOrchestrator.processMessage(
              message.text.body,
              sessionId,
              payload.contacts?.[0]?.wa_id,
              'whatsapp'
            );

            // Store channel message
            const channelMessage: ChannelMessage = {
              id: `msg_${Date.now()}`,
              agentId: agentId || 'unknown',
              channel: 'whatsapp',
              content: message.text.body,
              sender: 'user',
              timestamp: new Date(),
              processed: true,
              response,
            };
            this.channelMessages.push(channelMessage);

            return response;
          }
        }
      }

      // For other event types, just log them
      this.logger.log(`Processed WhatsApp ${eventType} event`);
      return { message: `WhatsApp ${eventType} event processed` };
    } catch (error) {
      this.logger.error('Failed to process WhatsApp event:', error.message);
      throw error;
    }
  }

  /**
   * Process Google Ads webhook event
   */
  private async processGoogleAdsEvent(eventType: string, payload: any, agentId?: string): Promise<any> {
    try {
      // For Google Ads events, we typically just log them for analytics
      this.logger.log(`Processed Google Ads ${eventType} event`);
      
      // Store channel message
      const channelMessage: ChannelMessage = {
        id: `msg_${Date.now()}`,
        agentId: agentId || 'unknown',
        channel: 'google-ads',
        content: JSON.stringify(payload),
        sender: 'system',
        timestamp: new Date(),
        processed: true,
      };
      this.channelMessages.push(channelMessage);

      return { message: `Google Ads ${eventType} event processed` };
    } catch (error) {
      this.logger.error('Failed to process Google Ads event:', error.message);
      throw error;
    }
  }

  /**
   * Process generic webhook event
   */
  private async processGenericEvent(eventType: string, payload: any, agentId?: string): Promise<any> {
    try {
      this.logger.log(`Processed generic ${eventType} event`);
      
      // Store channel message
      const channelMessage: ChannelMessage = {
        id: `msg_${Date.now()}`,
        agentId: agentId || 'unknown',
        channel: 'generic',
        content: JSON.stringify(payload),
        sender: 'system',
        timestamp: new Date(),
        processed: true,
      };
      this.channelMessages.push(channelMessage);

      return { message: `Generic ${eventType} event processed` };
    } catch (error) {
      this.logger.error('Failed to process generic event:', error.message);
      throw error;
    }
  }

  /**
   * Get recent webhook events
   * @param limit Number of events to return
   * @returns Array of webhook events
   */
  getRecentWebhookEvents(limit: number = 50): ColombiaTICWebhookEvent[] {
    return this.webhookEvents.slice(-limit);
  }

  /**
   * Get webhook events by channel
   * @param channel Channel name
   * @param limit Number of events to return
   * @returns Array of webhook events
   */
  getWebhookEventsByChannel(channel: string, limit: number = 50): ColombiaTICWebhookEvent[] {
    const filteredEvents = this.webhookEvents.filter(event => event.channel === channel);
    return filteredEvents.slice(-limit);
  }

  /**
   * Get recent channel messages
   * @param limit Number of messages to return
   * @returns Array of channel messages
   */
  getRecentChannelMessages(limit: number = 50): ChannelMessage[] {
    return this.channelMessages.slice(-limit);
  }

  /**
   * Get channel messages by channel
   * @param channel Channel name
   * @param limit Number of messages to return
   * @returns Array of channel messages
   */
  getChannelMessagesByChannel(channel: string, limit: number = 50): ChannelMessage[] {
    const filteredMessages = this.channelMessages.filter(msg => msg.channel === channel);
    return filteredMessages.slice(-limit);
  }

  /**
   * Get channel messages by agent
   * @param agentId Agent ID
   * @param limit Number of messages to return
   * @returns Array of channel messages
   */
  getChannelMessagesByAgent(agentId: string, limit: number = 50): ChannelMessage[] {
    const filteredMessages = this.channelMessages.filter(msg => msg.agentId === agentId);
    return filteredMessages.slice(-limit);
  }
}