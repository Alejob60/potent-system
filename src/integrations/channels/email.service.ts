import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ChannelAdapter, ChannelType, IncomingMessage, OutgoingMessage } from './channel-adapter.interface';

export interface EmailResult {
  recipient: string;
  success: boolean;
  result?: any;
  error?: string;
}

@Injectable()
export class EmailService implements ChannelAdapter {
  private readonly logger = new Logger(EmailService.name);
  readonly type = ChannelType.EMAIL;

  constructor(private readonly mailerService: MailerService) {}

  async sendMessage(message: OutgoingMessage): Promise<any> {
    return this.sendTextEmail(message.recipientId, 'MisyBot Notification', message.content);
  }

  async handleWebhook(payload: any): Promise<IncomingMessage[]> {
    // Los correos usualmente no vienen por webhooks standard de push
    // Se implementaría con SendGrid Inbound Parse o similar.
    return [];
  }

  /**
   * Send a simple text email
   * @param to Recipient email address
   * @param subject Email subject
   * @param text Email body text
   * @returns Response from email service
   */
  async sendTextEmail(to: string, subject: string, text: string): Promise<any> {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject,
        text,
      });

      this.logger.log(`Successfully sent email to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send an HTML email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email body HTML
   * @returns Response from email service
   */
  async sendHtmlEmail(to: string, subject: string, html: string): Promise<any> {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject,
        html,
      });

      this.logger.log(`Successfully sent HTML email to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send HTML email to ${to}: ${error.message}`);
      throw new Error(`Failed to send HTML email: ${error.message}`);
    }
  }

  /**
   * Send an email with attachments
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email body HTML
   * @param attachments Array of attachment objects
   * @returns Response from email service
   */
  async sendEmailWithAttachments(
    to: string,
    subject: string,
    html: string,
    attachments: any[]
  ): Promise<any> {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject,
        html,
        attachments,
      });

      this.logger.log(`Successfully sent email with attachments to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email with attachments to ${to}: ${error.message}`);
      throw new Error(`Failed to send email with attachments: ${error.message}`);
    }
  }

  /**
   * Send a templated email
   * @param to Recipient email address
   * @param subject Email subject
   * @param template Template name
   * @param context Template context data
   * @returns Response from email service
   */
  async sendTemplatedEmail(
    to: string,
    subject: string,
    template: string,
    context: any
  ): Promise<any> {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });

      this.logger.log(`Successfully sent templated email to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send templated email to ${to}: ${error.message}`);
      throw new Error(`Failed to send templated email: ${error.message}`);
    }
  }

  /**
   * Send a bulk email to multiple recipients
   * @param recipients Array of recipient email addresses
   * @param subject Email subject
   * @param html Email body HTML
   * @returns Response from email service
   */
  async sendBulkEmail(recipients: string[], subject: string, html: string): Promise<EmailResult[]> {
    try {
      const results: EmailResult[] = [];
      
      for (const recipient of recipients) {
        try {
          const result = await this.mailerService.sendMail({
            to: recipient,
            subject,
            html,
          });
          
          results.push({ recipient, success: true, result });
          this.logger.log(`Successfully sent bulk email to ${recipient}`);
        } catch (error) {
          results.push({ recipient, success: false, error: error.message });
          this.logger.error(`Failed to send bulk email to ${recipient}: ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to send bulk emails: ${error.message}`);
      throw new Error(`Failed to send bulk emails: ${error.message}`);
    }
  }
}