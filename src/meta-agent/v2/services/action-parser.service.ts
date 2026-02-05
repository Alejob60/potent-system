import { Injectable, Logger } from '@nestjs/common';
import { ActionDto } from '../dtos/process-response.dto';
import { z } from 'zod';

// Zod schemas for action validation
const BaseActionSchema = z.object({
  type: z.string().min(1),
  params: z.record(z.any()),
  target: z.string().optional(),
});

const CreateOrderActionSchema = BaseActionSchema.extend({
  type: z.literal('create_order'),
  params: z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    customerId: z.string().optional(),
    shippingAddress: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const GenerateVideoActionSchema = BaseActionSchema.extend({
  type: z.literal('generate_video'),
  params: z.object({
    script: z.string(),
    duration: z.number().positive().optional(),
    style: z.string().optional(),
    voiceOver: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const SchedulePostActionSchema = BaseActionSchema.extend({
  type: z.literal('schedule_post'),
  params: z.object({
    content: z.string(),
    platform: z.enum(['instagram', 'facebook', 'twitter', 'linkedin']),
    scheduledTime: z.string().datetime().optional(),
    mediaUrls: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const InitiateCallActionSchema = BaseActionSchema.extend({
  type: z.literal('initiate_call'),
  params: z.object({
    phoneNumber: z.string(),
    purpose: z.string().optional(),
    script: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const EscalateToHumanActionSchema = BaseActionSchema.extend({
  type: z.literal('escalate_to_human'),
  params: z.object({
    reason: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    department: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

@Injectable()
export class ActionParserService {
  private readonly logger = new Logger(ActionParserService.name);
  private readonly actionPattern = /<ACTION>(.*?)<\/ACTION>/gs;

  /**
   * Parse actions from LLM response text
   * @param responseText LLM response containing action markers
   * @returns Array of parsed and validated actions
   */
  parseActions(responseText: string): ActionDto[] {
    const actions: ActionDto[] = [];

    try {
      // Extract all action markers
      const matches = responseText.matchAll(this.actionPattern);

      for (const match of matches) {
        const actionJson = match[1].trim();
        
        try {
          const actionData = JSON.parse(actionJson);
          
          // Validate and parse action
          const validatedAction = this.validateAction(actionData);
          
          if (validatedAction) {
            actions.push({
              type: validatedAction.type,
              params: validatedAction.params,
              status: 'pending',
              target: validatedAction.target || this.getDefaultTarget(validatedAction.type)
            });

            this.logger.debug(`Parsed action: ${validatedAction.type}`);
          }
        } catch (parseError) {
          this.logger.warn(
            `Failed to parse action JSON: ${actionJson}`,
            parseError.message
          );
          // Continue parsing other actions
        }
      }
    } catch (error) {
      this.logger.error(`Error parsing actions: ${error.message}`);
    }

    this.logger.debug(`Parsed ${actions.length} action(s) from response`);
    return actions;
  }

  /**
   * Validate action against schema
   * @param actionData Raw action data
   * @returns Validated action or null
   */
  private validateAction(actionData: any): any | null {
    try {
      // Try to validate against specific schemas based on type
      switch (actionData.type) {
        case 'create_order':
          return CreateOrderActionSchema.parse(actionData);
        
        case 'generate_video':
          return GenerateVideoActionSchema.parse(actionData);
        
        case 'schedule_post':
          return SchedulePostActionSchema.parse(actionData);
        
        case 'initiate_call':
          return InitiateCallActionSchema.parse(actionData);
        
        case 'escalate_to_human':
          return EscalateToHumanActionSchema.parse(actionData);
        
        default:
          // Fallback to base schema for unknown action types
          this.logger.warn(`Unknown action type: ${actionData.type}, using base validation`);
          return BaseActionSchema.parse(actionData);
      }
    } catch (validationError) {
      this.logger.error(
        `Action validation failed for type "${actionData.type}":`,
        validationError.message
      );
      return null;
    }
  }

  /**
   * Get default target service for action type
   */
  private getDefaultTarget(actionType: string): string {
    const targetMap: Record<string, string> = {
      create_order: 'orders-service',
      generate_video: 'video-generator-service',
      schedule_post: 'post-scheduler-service',
      initiate_call: 'voice-service',
      escalate_to_human: 'support-service'
    };

    return targetMap[actionType] || 'default-service';
  }

  /**
   * Extract clean response text (without action markers)
   * @param responseText Full LLM response
   * @returns Cleaned response text
   */
  extractCleanResponse(responseText: string): string {
    // Remove all action markers
    return responseText.replace(this.actionPattern, '').trim();
  }

  /**
   * Validate that action params contain required fields
   * @param action Action to validate
   * @returns Validation result
   */
  validateActionParams(action: ActionDto): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Common validations
    if (!action.type || action.type.trim() === '') {
      errors.push('Action type is required');
    }

    if (!action.params || Object.keys(action.params).length === 0) {
      errors.push('Action params cannot be empty');
    }

    // Type-specific validations
    switch (action.type) {
      case 'create_order':
        if (!action.params.productId) {
          errors.push('productId is required for create_order action');
        }
        if (!action.params.quantity || action.params.quantity <= 0) {
          errors.push('quantity must be a positive number');
        }
        break;

      case 'generate_video':
        if (!action.params.script || action.params.script.trim() === '') {
          errors.push('script is required for generate_video action');
        }
        break;

      case 'schedule_post':
        if (!action.params.content || action.params.content.trim() === '') {
          errors.push('content is required for schedule_post action');
        }
        if (!action.params.platform) {
          errors.push('platform is required for schedule_post action');
        }
        break;

      case 'initiate_call':
        if (!action.params.phoneNumber) {
          errors.push('phoneNumber is required for initiate_call action');
        }
        break;

      case 'escalate_to_human':
        if (!action.params.reason) {
          errors.push('reason is required for escalate_to_human action');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Build action example for prompting
   * @param actionType Action type
   * @returns Example action string
   */
  buildActionExample(actionType: string): string {
    const examples: Record<string, string> = {
      create_order: '<ACTION>{"type":"create_order","params":{"productId":"prod-123","quantity":2},"target":"orders-service"}</ACTION>',
      generate_video: '<ACTION>{"type":"generate_video","params":{"script":"Video script here","duration":30},"target":"video-generator-service"}</ACTION>',
      schedule_post: '<ACTION>{"type":"schedule_post","params":{"content":"Post content","platform":"instagram"},"target":"post-scheduler-service"}</ACTION>',
      initiate_call: '<ACTION>{"type":"initiate_call","params":{"phoneNumber":"+1234567890","purpose":"Follow-up"},"target":"voice-service"}</ACTION>',
      escalate_to_human: '<ACTION>{"type":"escalate_to_human","params":{"reason":"Complex issue","priority":"high"},"target":"support-service"}</ACTION>'
    };

    return examples[actionType] || '<ACTION>{"type":"unknown","params":{}}</ACTION>';
  }
}
