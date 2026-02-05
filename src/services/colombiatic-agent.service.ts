import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ColombiaTICAgentConfig {
  siteUrl: string;
  industry: string;
  language: string;
  tone: string;
  connectChannels: string[];
}

export interface ColombiaTICAgent {
  id: string;
  config: ColombiaTICAgentConfig;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'pending';
  clientId: string;
}

@Injectable()
export class ColombiaTICAgentService {
  private readonly logger = new Logger(ColombiaTICAgentService.name);
  private agents: Map<string, ColombiaTICAgent> = new Map();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Create a new ColombiaTIC AI Agent
   * @param config Agent configuration
   * @returns Created agent
   */
  async createAgent(config: ColombiaTICAgentConfig): Promise<ColombiaTICAgent> {
    try {
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const agent: ColombiaTICAgent = {
        id: agentId,
        config,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
        clientId,
      };

      this.agents.set(agentId, agent);
      this.logger.log(`Created new ColombiaTIC agent: ${agentId}`);

      // Configure webhooks for connected channels
      await this.configureWebhooks(agentId, config.connectChannels);

      // Update agent status to active
      agent.status = 'active';
      agent.updatedAt = new Date();
      this.agents.set(agentId, agent);

      return agent;
    } catch (error) {
      this.logger.error('Failed to create ColombiaTIC agent:', error.message);
      throw error;
    }
  }

  /**
   * Get agent by ID
   * @param id Agent ID
   * @returns Agent or null if not found
   */
  getAgent(id: string): ColombiaTICAgent | null {
    return this.agents.get(id) || null;
  }

  /**
   * Update agent configuration
   * @param id Agent ID
   * @param config Updated configuration
   * @returns Updated agent
   */
  async updateAgent(id: string, config: Partial<ColombiaTICAgentConfig>): Promise<ColombiaTICAgent> {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Update configuration
    agent.config = { ...agent.config, ...config };
    agent.updatedAt = new Date();
    this.agents.set(id, agent);

    // Reconfigure webhooks if channels changed
    if (config.connectChannels) {
      await this.configureWebhooks(id, config.connectChannels);
    }

    this.logger.log(`Updated ColombiaTIC agent: ${id}`);
    return agent;
  }

  /**
   * Configure webhooks for connected channels
   * @param agentId Agent ID
   * @param channels Channels to configure
   */
  private async configureWebhooks(agentId: string, channels: string[]): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'facebook':
            await this.configureFacebookWebhook(agentId);
            break;
          case 'whatsapp':
            await this.configureWhatsAppWebhook(agentId);
            break;
          case 'google-ads':
            await this.configureGoogleAdsWebhook(agentId);
            break;
          default:
            this.logger.warn(`Unsupported channel for webhook configuration: ${channel}`);
        }
      } catch (error) {
        this.logger.error(`Failed to configure webhook for ${channel}:`, error.message);
      }
    }
  }

  /**
   * Configure Facebook webhook
   * @param agentId Agent ID
   */
  private async configureFacebookWebhook(agentId: string): Promise<void> {
    // In a real implementation, this would register the webhook with Facebook's API
    this.logger.log(`Configured Facebook webhook for agent: ${agentId}`);
  }

  /**
   * Configure WhatsApp webhook
   * @param agentId Agent ID
   */
  private async configureWhatsAppWebhook(agentId: string): Promise<void> {
    // In a real implementation, this would register the webhook with WhatsApp's API
    this.logger.log(`Configured WhatsApp webhook for agent: ${agentId}`);
  }

  /**
   * Configure Google Ads webhook
   * @param agentId Agent ID
   */
  private async configureGoogleAdsWebhook(agentId: string): Promise<void> {
    // In a real implementation, this would register the webhook with Google Ads API
    this.logger.log(`Configured Google Ads webhook for agent: ${agentId}`);
  }

  /**
   * Get webhook configuration for an agent
   * @param agentId Agent ID
   * @returns Webhook configuration
   */
  getWebhookConfiguration(agentId: string): any {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Return mock webhook configuration
    return {
      agentId,
      channels: agent.config.connectChannels,
      endpoints: agent.config.connectChannels.map(channel => {
        switch (channel) {
          case 'facebook':
            return {
              channel,
              endpoint: `/meta/facebook/webhook`,
              verificationToken: `fb_verify_${agentId}`,
            };
          case 'whatsapp':
            return {
              channel,
              endpoint: `/meta/whatsapp/webhook`,
              verificationToken: `wa_verify_${agentId}`,
            };
          case 'google-ads':
            return {
              channel,
              endpoint: `/google/ads/webhook`,
              verificationToken: `ga_verify_${agentId}`,
            };
          default:
            return {
              channel,
              endpoint: `/webhook/${channel}`,
              verificationToken: `verify_${agentId}_${channel}`,
            };
        }
      }),
    };
  }

  /**
   * Generate universal chat widget script
   * @param clientId Client ID
   * @returns Script tag for the chat widget
   */
  generateChatWidgetScript(clientId: string): string {
    return `<script src="https://cdn.colombiatic.ai/widget.js" data-client="${clientId}" async></script>`;
  }
}