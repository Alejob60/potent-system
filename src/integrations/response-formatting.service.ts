import { Injectable, Logger } from '@nestjs/common';

export interface FormattedResponse {
  channel: string;
  content: any;
  contentType: string;
  metadata?: any;
}

export interface FormattingTemplate {
  id: string;
  name: string;
  channel: string;
  template: string;
  variables: string[];
  createdAt: Date;
}

export interface ResponseFormatRule {
  id: string;
  name: string;
  conditions: ResponseCondition[];
  formatter: ResponseFormatter;
  priority: number;
  active: boolean;
}

export interface ResponseCondition {
  field: string;
  operator: string;
  value: any;
}

export interface ResponseFormatter {
  type: string;
  templateId?: string;
  transformation?: string;
  parameters?: any;
}

@Injectable()
export class ResponseFormattingService {
  private readonly logger = new Logger(ResponseFormattingService.name);
  private readonly templates: Map<string, FormattingTemplate> = new Map();
  private readonly formatRules: Map<string, ResponseFormatRule> = new Map();

  constructor() {
    // Initialize with default templates
    this.initializeDefaultTemplates();
  }

  /**
   * Add a formatting template
   * @param template Formatting template
   */
  addTemplate(template: FormattingTemplate): void {
    this.templates.set(template.id, template);
    this.logger.log(`Added formatting template: ${template.name}`);
  }

  /**
   * Get a formatting template
   * @param templateId Template ID
   * @returns Formatting template or null
   */
  getTemplate(templateId: string): FormattingTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Remove a formatting template
   * @param templateId Template ID
   * @returns Boolean indicating success
   */
  removeTemplate(templateId: string): boolean {
    const result = this.templates.delete(templateId);
    if (result) {
      this.logger.log(`Removed formatting template: ${templateId}`);
    }
    return result;
  }

  /**
   * Add a response format rule
   * @param rule Response format rule
   */
  addFormatRule(rule: ResponseFormatRule): void {
    this.formatRules.set(rule.id, rule);
    this.logger.log(`Added response format rule: ${rule.name}`);
  }

  /**
   * Get a response format rule
   * @param ruleId Rule ID
   * @returns Response format rule or null
   */
  getFormatRule(ruleId: string): ResponseFormatRule | null {
    return this.formatRules.get(ruleId) || null;
  }

  /**
   * Remove a response format rule
   * @param ruleId Rule ID
   * @returns Boolean indicating success
   */
  removeFormatRule(ruleId: string): boolean {
    const result = this.formatRules.delete(ruleId);
    if (result) {
      this.logger.log(`Removed response format rule: ${ruleId}`);
    }
    return result;
  }

  /**
   * Format a response for a specific channel
   * @param channel Target channel
   * @param content Response content
   * @param context Additional context
   * @returns Formatted response
   */
  formatResponse(
    channel: string,
    content: string,
    context?: any,
  ): FormattedResponse {
    try {
      // First, check if there are specific format rules
      const matchingRule = this.findMatchingRule(channel, content, context);
      
      if (matchingRule) {
        // Apply the formatter
        return this.applyFormatter(matchingRule.formatter, channel, content, context);
      }

      // If no specific rules match, use default formatting based on channel
      return this.getDefaultFormatting(channel, content, context);
    } catch (error) {
      this.logger.error(`Error formatting response: ${error.message}`);
      // Fallback to default formatting
      return this.getDefaultFormatting(channel, content, context);
    }
  }

  /**
   * Format a response using a template
   * @param templateId Template ID
   * @param variables Template variables
   * @returns Formatted response content
   */
  formatWithTemplate(templateId: string, variables: Record<string, any>): string {
    try {
      const template = this.templates.get(templateId);
      
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      let formattedContent = template.template;
      
      // Replace variables in the template
      for (const [key, value] of Object.entries(variables)) {
        formattedContent = formattedContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }

      return formattedContent;
    } catch (error) {
      this.logger.error(`Error formatting with template: ${error.message}`);
      throw new Error(`Failed to format with template: ${error.message}`);
    }
  }

  /**
   * Get all templates for a channel
   * @param channel Channel name
   * @returns Array of templates
   */
  getTemplatesForChannel(channel: string): FormattingTemplate[] {
    const result: FormattingTemplate[] = [];
    
    for (const template of this.templates.values()) {
      if (template.channel === channel) {
        result.push(template);
      }
    }
    
    return result;
  }

  /**
   * Find the first matching format rule
   * @param channel Target channel
   * @param content Response content
   * @param context Additional context
   * @returns Matching format rule or null
   */
  private findMatchingRule(
    channel: string,
    content: string,
    context?: any,
  ): ResponseFormatRule | null {
    // Get active rules sorted by priority
    const activeRules = Array.from(this.formatRules.values())
      .filter(rule => rule.active)
      .sort((a, b) => a.priority - b.priority);

    // Check each rule
    for (const rule of activeRules) {
      if (this.evaluateConditions(rule.conditions, channel, content, context)) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Evaluate response conditions
   * @param conditions Conditions to evaluate
   * @param channel Target channel
   * @param content Response content
   * @param context Additional context
   * @returns Boolean indicating if all conditions match
   */
  private evaluateConditions(
    conditions: ResponseCondition[],
    channel: string,
    content: string,
    context?: any,
  ): boolean {
    for (const condition of conditions) {
      let contextValue: any;
      
      // Extract value based on field
      switch (condition.field) {
        case 'channel':
          contextValue = channel;
          break;
        case 'content':
          contextValue = content;
          break;
        default:
          if (context && condition.field.startsWith('context.')) {
            const contextKey = condition.field.substring(8);
            contextValue = context[contextKey];
          }
          break;
      }

      // Evaluate condition based on operator
      switch (condition.operator) {
        case 'equals':
        case '==':
          if (contextValue != condition.value) return false;
          break;
        case 'notEquals':
        case '!=':
          if (contextValue == condition.value) return false;
          break;
        case 'contains':
          if (typeof contextValue === 'string' && !contextValue.includes(condition.value)) return false;
          break;
        case 'startsWith':
          if (typeof contextValue === 'string' && !contextValue.startsWith(condition.value)) return false;
          break;
        case 'endsWith':
          if (typeof contextValue === 'string' && !contextValue.endsWith(condition.value)) return false;
          break;
        case 'greaterThan':
        case '>':
          if (contextValue <= condition.value) return false;
          break;
        case 'lessThan':
        case '<':
          if (contextValue >= condition.value) return false;
          break;
        default:
          this.logger.warn(`Unknown operator: ${condition.operator}`);
          return false;
      }
    }

    return true;
  }

  /**
   * Apply a formatter to content
   * @param formatter Response formatter
   * @param channel Target channel
   * @param content Response content
   * @param context Additional context
   * @returns Formatted response
   */
  private applyFormatter(
    formatter: ResponseFormatter,
    channel: string,
    content: string,
    context?: any,
  ): FormattedResponse {
    switch (formatter.type) {
      case 'template':
        if (formatter.templateId) {
          const variables = formatter.parameters?.variables || {};
          const formattedContent = this.formatWithTemplate(formatter.templateId, variables);
          return {
            channel,
            content: formattedContent,
            contentType: 'text',
            metadata: formatter.parameters,
          };
        }
        break;

      case 'transformation':
        if (formatter.transformation) {
          const transformedContent = this.applyTransformation(formatter.transformation, content, context);
          return {
            channel,
            content: transformedContent,
            contentType: 'text',
            metadata: formatter.parameters,
          };
        }
        break;

      default:
        this.logger.warn(`Unknown formatter type: ${formatter.type}`);
        break;
    }

    // Fallback to default formatting
    return this.getDefaultFormatting(channel, content, context);
  }

  /**
   * Apply a transformation to content
   * @param transformation Transformation type
   * @param content Response content
   * @param context Additional context
   * @returns Transformed content
   */
  private applyTransformation(
    transformation: string,
    content: string,
    context?: any,
  ): string {
    switch (transformation) {
      case 'uppercase':
        return content.toUpperCase();
      
      case 'lowercase':
        return content.toLowerCase();
      
      case 'capitalize':
        return content.charAt(0).toUpperCase() + content.slice(1);
      
      case 'truncate':
        const maxLength = context?.maxLength || 100;
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
      
      default:
        this.logger.warn(`Unknown transformation: ${transformation}`);
        return content;
    }
  }

  /**
   * Get default formatting based on channel
   * @param channel Target channel
   * @param content Response content
   * @param context Additional context
   * @returns Formatted response
   */
  private getDefaultFormatting(
    channel: string,
    content: string,
    context?: any,
  ): FormattedResponse {
    // Channel-specific default formatting
    switch (channel) {
      case 'whatsapp':
        // WhatsApp supports rich text formatting
        return {
          channel: 'whatsapp',
          content: this.formatForWhatsApp(content),
          contentType: 'text',
        };

      case 'instagram':
        // Instagram DMs have character limits
        return {
          channel: 'instagram',
          content: this.truncateForInstagram(content),
          contentType: 'text',
        };

      case 'facebook':
        // Facebook Messenger supports quick replies and templates
        return {
          channel: 'facebook',
          content: this.formatForFacebook(content),
          contentType: 'text',
        };

      case 'email':
        // Emails can be HTML or plain text
        const isHtml = context?.isHtml || false;
        return {
          channel: 'email',
          content: isHtml ? this.formatForEmailHtml(content) : content,
          contentType: isHtml ? 'html' : 'text',
        };

      default:
        // Default to plain text
        return {
          channel,
          content,
          contentType: 'text',
        };
    }
  }

  /**
   * Format content for WhatsApp
   * @param content Response content
   * @returns Formatted content
   */
  private formatForWhatsApp(content: string): string {
    // WhatsApp supports bold, italic, strikethrough formatting
    // For now, we'll just return the content as-is
    return content;
  }

  /**
   * Truncate content for Instagram
   * @param content Response content
   * @returns Truncated content
   */
  private truncateForInstagram(content: string): string {
    // Instagram DMs have a 1000 character limit
    const maxLength = 1000;
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  /**
   * Format content for Facebook
   * @param content Response content
   * @returns Formatted content
   */
  private formatForFacebook(content: string): string {
    // Facebook Messenger supports quick replies and templates
    // For now, we'll just return the content as-is
    return content;
  }

  /**
   * Format content for email HTML
   * @param content Response content
   * @returns Formatted HTML content
   */
  private formatForEmailHtml(content: string): string {
    // Simple HTML formatting
    return `<p>${content.replace(/\n/g, '</p><p>')}</p>`;
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // WhatsApp welcome template
    this.addTemplate({
      id: 'whatsapp-welcome',
      name: 'WhatsApp Welcome Message',
      channel: 'whatsapp',
      template: 'Hello {{name}}! Welcome to our service. How can we help you today?',
      variables: ['name'],
      createdAt: new Date(),
    });

    // Facebook quick reply template
    this.addTemplate({
      id: 'facebook-quick-replies',
      name: 'Facebook Quick Replies',
      channel: 'facebook',
      template: '{{message}}\n\nPlease select an option:\n{{options}}',
      variables: ['message', 'options'],
      createdAt: new Date(),
    });

    // Email template
    this.addTemplate({
      id: 'email-template',
      name: 'Email Template',
      channel: 'email',
      template: 'Dear {{name}},\n\n{{message}}\n\nBest regards,\n{{signature}}',
      variables: ['name', 'message', 'signature'],
      createdAt: new Date(),
    });
  }
}