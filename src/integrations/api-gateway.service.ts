import { Injectable, Logger } from '@nestjs/common';
import { WhatsappBusinessService } from './channels/whatsapp-business.service';
import { InstagramDmService } from './channels/instagram-dm.service';
import { FacebookMessengerService } from './channels/facebook-messenger.service';
import { EmailService } from './channels/email.service';

export interface ChannelResult {
  channel: string;
  recipient: string;
  success: boolean;
  result?: any;
  error?: string;
}

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);
  private readonly rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private readonly whatsappService: WhatsappBusinessService,
    private readonly instagramService: InstagramDmService,
    private readonly facebookService: FacebookMessengerService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Send a message through the appropriate channel
   * @param channel Target channel (whatsapp, instagram, facebook, email)
   * @param recipient Recipient identifier (phone number, user ID, email)
   * @param message Message content
   * @param options Additional options for the message
   * @returns Response from the target channel
   */
  async sendMessage(
    channel: string,
    recipient: string,
    message: string,
    options?: any,
  ): Promise<any> {
    try {
      // Check rate limiting
      if (this.isRateLimited(channel, recipient)) {
        throw new Error(`Rate limit exceeded for ${channel} channel`);
      }

      let result: any;

      switch (channel.toLowerCase()) {
        case 'whatsapp':
          if (options?.template) {
            result = await this.whatsappService.sendTemplateMessage(
              recipient,
              options.template.name,
              options.template.language,
              options.template.components,
            );
          } else {
            result = await this.whatsappService.sendTextMessage(recipient, message);
          }
          break;

        case 'instagram':
          if (options?.media) {
            result = await this.instagramService.sendMediaMessage(
              recipient,
              options.media.type,
              options.media.url,
              message,
            );
          } else {
            result = await this.instagramService.sendTextMessage(recipient, message);
          }
          break;

        case 'facebook':
          if (options?.template) {
            result = await this.facebookService.sendTemplateMessage(recipient, options.template);
          } else if (options?.quickReplies) {
            result = await this.facebookService.sendQuickReplyMessage(
              recipient,
              message,
              options.quickReplies,
            );
          } else {
            result = await this.facebookService.sendTextMessage(recipient, message);
          }
          break;

        case 'email':
          if (options?.html) {
            result = await this.emailService.sendHtmlEmail(recipient, options.subject, options.html);
          } else if (options?.template) {
            result = await this.emailService.sendTemplatedEmail(
              recipient,
              options.subject,
              options.template.name,
              options.template.context,
            );
          } else {
            result = await this.emailService.sendTextEmail(recipient, options?.subject || 'Message', message);
          }
          break;

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      // Update rate limiting
      this.updateRateLimit(channel, recipient);

      this.logger.log(`Successfully sent message through ${channel} to ${recipient}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message through ${channel} to ${recipient}: ${error.message}`);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Send a bulk message to multiple recipients across channels
   * @param recipients Array of recipient objects with channel and identifier
   * @param message Message content
   * @param options Additional options for the message
   * @returns Array of results for each recipient
   */
  async sendBulkMessage(
    recipients: Array<{ channel: string; recipient: string }>,
    message: string,
    options?: any,
  ): Promise<ChannelResult[]> {
    try {
      const results: ChannelResult[] = [];

      for (const { channel, recipient } of recipients) {
        try {
          const result = await this.sendMessage(channel, recipient, message, options);
          results.push({
            channel,
            recipient,
            success: true,
            result,
          });
        } catch (error) {
          results.push({
            channel,
            recipient,
            success: false,
            error: error.message,
          });
          this.logger.error(`Failed to send bulk message to ${recipient} via ${channel}: ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to send bulk messages: ${error.message}`);
      throw new Error(`Failed to send bulk messages: ${error.message}`);
    }
  }

  /**
   * Handle incoming webhook events from any channel
   * @param channel Source channel
   * @param payload Webhook payload
   * @returns Processed event data
   */
  async handleWebhookEvent(channel: string, payload: any): Promise<any> {
    try {
      let result: any;

      switch (channel.toLowerCase()) {
        case 'whatsapp':
          result = await this.whatsappService.handleWebhookEvent(payload);
          break;

        case 'instagram':
          result = await this.instagramService.handleWebhookEvent(payload);
          break;

        case 'facebook':
          result = await this.facebookService.handleWebhookEvent(payload);
          break;

        default:
          throw new Error(`Unsupported channel for webhook: ${channel}`);
      }

      this.logger.log(`Successfully processed webhook event from ${channel}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to process webhook event from ${channel}: ${error.message}`);
      throw new Error(`Failed to process webhook event: ${error.message}`);
    }
  }

  /**
   * Verify webhook subscription for a channel
   * @param channel Target channel
   * @param verifyToken Token to verify webhook
   * @param challenge Challenge string
   * @returns Challenge response for verification
   */
  verifyWebhook(channel: string, verifyToken: string, challenge: string): string {
    try {
      switch (channel.toLowerCase()) {
        case 'whatsapp':
          return this.whatsappService.verifyWebhook({ token: verifyToken, challenge });

        case 'instagram':
          return this.instagramService.verifyWebhook({ token: verifyToken, challenge });

        case 'facebook':
          return this.facebookService.verifyWebhook({ token: verifyToken, challenge });

        default:
          throw new Error(`Unsupported channel for webhook verification: ${channel}`);
      }
    } catch (error) {
      this.logger.error(`Failed to verify webhook for ${channel}: ${error.message}`);
      throw new Error(`Failed to verify webhook: ${error.message}`);
    }
  }

  /**
   * Check if a recipient is rate limited for a channel
   * @param channel Target channel
   * @param recipient Recipient identifier
   * @returns Boolean indicating if rate limited
   */
  private isRateLimited(channel: string, recipient: string): boolean {
    const key = `${channel}:${recipient}`;
    const rateLimit = this.rateLimitStore.get(key);

    if (!rateLimit) {
      return false;
    }

    const now = Date.now();
    if (now > rateLimit.resetTime) {
      // Reset the rate limit counter
      this.rateLimitStore.delete(key);
      return false;
    }

    // Check if the rate limit has been exceeded (e.g., 10 requests per minute)
    return rateLimit.count >= 10;
  }

  /**
   * Update rate limiting for a recipient on a channel
   * @param channel Target channel
   * @param recipient Recipient identifier
   */
  private updateRateLimit(channel: string, recipient: string): void {
    const key = `${channel}:${recipient}`;
    const rateLimit = this.rateLimitStore.get(key);
    const now = Date.now();
    const resetTime = now + 60000; // 1 minute window

    if (!rateLimit) {
      this.rateLimitStore.set(key, { count: 1, resetTime });
    } else {
      this.rateLimitStore.set(key, { count: rateLimit.count + 1, resetTime });
    }
  }

  /**
   * Get channel-specific rate limit information
   * @param channel Target channel
   * @param recipient Recipient identifier
   * @returns Rate limit information
   */
  getRateLimitInfo(channel: string, recipient: string): { count: number; resetTime: number } | null {
    const key = `${channel}:${recipient}`;
    return this.rateLimitStore.get(key) || null;
  }
}