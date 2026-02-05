import { Injectable, Logger } from '@nestjs/common';

export interface RoutingRule {
  id: string;
  name: string;
  conditions: RoutingCondition[];
  actions: RoutingAction[];
  priority: number;
  active: boolean;
}

export interface RoutingCondition {
  field: string;
  operator: string;
  value: any;
}

export interface RoutingAction {
  type: string;
  channel: string;
  template?: string;
  parameters?: any;
}

export interface MessageContext {
  channelId: string;
  recipient: string;
  message: string;
  metadata: any;
}

@Injectable()
export class ChannelRoutingService {
  private readonly logger = new Logger(ChannelRoutingService.name);
  private readonly routingRules: Map<string, RoutingRule> = new Map();
  private readonly channelPriorities: Map<string, number> = new Map();

  constructor() {
    // Set default channel priorities
    this.setDefaultChannelPriorities();
  }

  /**
   * Add a routing rule
   * @param rule Routing rule to add
   */
  addRoutingRule(rule: RoutingRule): void {
    this.routingRules.set(rule.id, rule);
    this.logger.log(`Added routing rule: ${rule.name}`);
  }

  /**
   * Remove a routing rule
   * @param ruleId ID of the rule to remove
   */
  removeRoutingRule(ruleId: string): void {
    this.routingRules.delete(ruleId);
    this.logger.log(`Removed routing rule: ${ruleId}`);
  }

  /**
   * Get all routing rules
   * @returns Array of routing rules
   */
  getRoutingRules(): RoutingRule[] {
    return Array.from(this.routingRules.values());
  }

  /**
   * Route a message based on context and rules
   * @param context Message context
   * @returns Routing decision
   */
  routeMessage(context: MessageContext): { channel: string; template?: string; parameters?: any } {
    try {
      // First, check if there are specific routing rules
      const matchingRule = this.findMatchingRule(context);
      
      if (matchingRule) {
        // Use the first action from the matching rule
        const action = matchingRule.actions[0];
        return {
          channel: action.channel,
          template: action.template,
          parameters: action.parameters,
        };
      }

      // If no specific rules match, use default routing based on context
      return this.getDefaultRouting(context);
    } catch (error) {
      this.logger.error(`Error routing message: ${error.message}`);
      // Fallback to default routing
      return this.getDefaultRouting(context);
    }
  }

  /**
   * Set channel priority for fallback routing
   * @param channel Channel name
   * @param priority Priority value (lower is higher priority)
   */
  setChannelPriority(channel: string, priority: number): void {
    this.channelPriorities.set(channel, priority);
    this.logger.log(`Set priority ${priority} for channel ${channel}`);
  }

  /**
   * Get channel priorities
   * @returns Map of channel priorities
   */
  getChannelPriorities(): Map<string, number> {
    return new Map(this.channelPriorities);
  }

  /**
   * Find the first matching routing rule for a context
   * @param context Message context
   * @returns Matching routing rule or null
   */
  private findMatchingRule(context: MessageContext): RoutingRule | null {
    // Get active rules sorted by priority
    const activeRules = Array.from(this.routingRules.values())
      .filter(rule => rule.active)
      .sort((a, b) => a.priority - b.priority);

    // Check each rule
    for (const rule of activeRules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Evaluate routing conditions against message context
   * @param conditions Conditions to evaluate
   * @param context Message context
   * @returns Boolean indicating if all conditions match
   */
  private evaluateConditions(conditions: RoutingCondition[], context: MessageContext): boolean {
    for (const condition of conditions) {
      let contextValue: any;
      
      // Extract value from context based on field
      if (condition.field.startsWith('metadata.')) {
        const metadataKey = condition.field.substring(9);
        contextValue = context.metadata[metadataKey];
      } else {
        contextValue = context[condition.field as keyof MessageContext];
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
   * Get default routing based on context
   * @param context Message context
   * @returns Default routing decision
   */
  private getDefaultRouting(context: MessageContext): { channel: string; template?: string; parameters?: any } {
    // If channel is already specified in context, use it
    if (context.channelId) {
      return { channel: context.channelId };
    }

    // Otherwise, use channel priorities to determine the best channel
    const sortedChannels = Array.from(this.channelPriorities.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([channel, _]) => channel);

    // Return the highest priority channel
    if (sortedChannels.length > 0) {
      return { channel: sortedChannels[0] };
    }

    // Fallback to a default channel
    return { channel: 'whatsapp' };
  }

  /**
   * Set default channel priorities
   */
  private setDefaultChannelPriorities(): void {
    // WhatsApp Business: highest priority (1)
    this.setChannelPriority('whatsapp', 1);
    
    // Facebook Messenger: high priority (2)
    this.setChannelPriority('facebook', 2);
    
    // Instagram DM: medium priority (3)
    this.setChannelPriority('instagram', 3);
    
    // Email: lower priority (4)
    this.setChannelPriority('email', 4);
  }
}