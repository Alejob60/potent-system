import { Injectable, Logger } from '@nestjs/common';

export interface ConversationContext {
  id: string;
  channelId: string;
  recipientId: string;
  tenantId?: string;
  sessionId?: string;
  language: string;
  timezone: string;
  variables: Map<string, any>;
  history: MessageHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageHistory {
  id: string;
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  content: string;
  metadata?: any;
}

export interface ContextUpdate {
  variables?: Record<string, any>;
  language?: string;
  timezone?: string;
  appendToHistory?: MessageHistory;
}

@Injectable()
export class ContextManagementService {
  private readonly logger = new Logger(ContextManagementService.name);
  private readonly contexts: Map<string, ConversationContext> = new Map();
  private readonly defaultContext: Partial<ConversationContext> = {
    language: 'en',
    timezone: 'UTC',
    variables: new Map(),
    history: [],
  };

  /**
   * Create a new conversation context
   * @param channelId Channel identifier
   * @param recipientId Recipient identifier
   * @param tenantId Optional tenant identifier
   * @param sessionId Optional session identifier
   * @returns Created context
   */
  createContext(
    channelId: string,
    recipientId: string,
    tenantId?: string,
    sessionId?: string,
  ): ConversationContext {
    try {
      const contextId = this.generateContextId(channelId, recipientId);
      
      const context: ConversationContext = {
        id: contextId,
        channelId,
        recipientId,
        tenantId,
        sessionId,
        language: this.defaultContext.language!,
        timezone: this.defaultContext.timezone!,
        variables: new Map(this.defaultContext.variables!),
        history: [...this.defaultContext.history!],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.contexts.set(contextId, context);
      this.logger.log(`Created context for ${channelId}:${recipientId}`);
      
      return context;
    } catch (error) {
      this.logger.error(`Failed to create context: ${error.message}`);
      throw new Error(`Failed to create context: ${error.message}`);
    }
  }

  /**
   * Get an existing conversation context or create a new one
   * @param channelId Channel identifier
   * @param recipientId Recipient identifier
   * @param tenantId Optional tenant identifier
   * @param sessionId Optional session identifier
   * @returns Conversation context
   */
  getContext(
    channelId: string,
    recipientId: string,
    tenantId?: string,
    sessionId?: string,
  ): ConversationContext {
    const contextId = this.generateContextId(channelId, recipientId);
    let context = this.contexts.get(contextId);

    if (!context) {
      context = this.createContext(channelId, recipientId, tenantId, sessionId);
    }

    return context;
  }

  /**
   * Update an existing conversation context
   * @param channelId Channel identifier
   * @param recipientId Recipient identifier
   * @param updates Context updates
   * @returns Updated context
   */
  updateContext(
    channelId: string,
    recipientId: string,
    updates: ContextUpdate,
  ): ConversationContext {
    try {
      const contextId = this.generateContextId(channelId, recipientId);
      const context = this.contexts.get(contextId);

      if (!context) {
        throw new Error(`Context not found for ${channelId}:${recipientId}`);
      }

      // Apply updates
      if (updates.variables) {
        Object.entries(updates.variables).forEach(([key, value]) => {
          context.variables.set(key, value);
        });
      }

      if (updates.language) {
        context.language = updates.language;
      }

      if (updates.timezone) {
        context.timezone = updates.timezone;
      }

      if (updates.appendToHistory) {
        context.history.push(updates.appendToHistory);
      }

      context.updatedAt = new Date();
      this.contexts.set(contextId, context);

      this.logger.log(`Updated context for ${channelId}:${recipientId}`);
      return context;
    } catch (error) {
      this.logger.error(`Failed to update context: ${error.message}`);
      throw new Error(`Failed to update context: ${error.message}`);
    }
  }

  /**
   * Delete a conversation context
   * @param channelId Channel identifier
   * @param recipientId Recipient identifier
   * @returns Boolean indicating success
   */
  deleteContext(channelId: string, recipientId: string): boolean {
    try {
      const contextId = this.generateContextId(channelId, recipientId);
      const result = this.contexts.delete(contextId);
      
      if (result) {
        this.logger.log(`Deleted context for ${channelId}:${recipientId}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete context: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all contexts for a recipient across all channels
   * @param recipientId Recipient identifier
   * @returns Array of conversation contexts
   */
  getContextsForRecipient(recipientId: string): ConversationContext[] {
    const result: ConversationContext[] = [];
    
    for (const context of this.contexts.values()) {
      if (context.recipientId === recipientId) {
        result.push(context);
      }
    }
    
    return result;
  }

  /**
   * Clear expired contexts
   * @param maxAge Maximum age in milliseconds (default: 24 hours)
   * @returns Number of contexts cleared
   */
  clearExpiredContexts(maxAge: number = 24 * 60 * 60 * 1000): number {
    try {
      const now = Date.now();
      let count = 0;
      
      for (const [contextId, context] of this.contexts.entries()) {
        const age = now - context.updatedAt.getTime();
        
        if (age > maxAge) {
          this.contexts.delete(contextId);
          count++;
        }
      }
      
      if (count > 0) {
        this.logger.log(`Cleared ${count} expired contexts`);
      }
      
      return count;
    } catch (error) {
      this.logger.error(`Failed to clear expired contexts: ${error.message}`);
      return 0;
    }
  }

  /**
   * Generate a unique context ID
   * @param channelId Channel identifier
   * @param recipientId Recipient identifier
   * @returns Unique context ID
   */
  private generateContextId(channelId: string, recipientId: string): string {
    return `${channelId}:${recipientId}`;
  }
}