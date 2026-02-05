import { Injectable, Logger } from '@nestjs/common';

export interface CrossChannelConversation {
  id: string;
  recipientId: string;
  tenantId?: string;
  channels: ChannelParticipation[];
  contextId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ChannelParticipation {
  channelId: string;
  conversationId: string;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
}

export interface ConversationTransition {
  fromChannel: string;
  toChannel: string;
  reason: string;
  timestamp: Date;
  metadata?: any;
}

@Injectable()
export class ConversationContinuityService {
  private readonly logger = new Logger(ConversationContinuityService.name);
  private readonly conversations: Map<string, CrossChannelConversation> = new Map();
  private readonly transitions: Map<string, ConversationTransition[]> = new Map();

  /**
   * Start a cross-channel conversation
   * @param recipientId Recipient identifier
   * @param initialChannel Initial channel
   * @param initialConversationId Initial conversation ID
   * @param tenantId Optional tenant identifier
   * @param contextId Optional context ID
   * @returns Created cross-channel conversation
   */
  startCrossChannelConversation(
    recipientId: string,
    initialChannel: string,
    initialConversationId: string,
    tenantId?: string,
    contextId?: string,
  ): CrossChannelConversation {
    try {
      const conversationId = this.generateConversationId(recipientId);
      
      const conversation: CrossChannelConversation = {
        id: conversationId,
        recipientId,
        tenantId,
        channels: [
          {
            channelId: initialChannel,
            conversationId: initialConversationId,
            startedAt: new Date(),
            isActive: true,
          },
        ],
        contextId: contextId || this.generateContextId(recipientId),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      this.conversations.set(conversationId, conversation);
      this.logger.log(`Started cross-channel conversation ${conversationId} for recipient ${recipientId}`);
      
      return conversation;
    } catch (error) {
      this.logger.error(`Failed to start cross-channel conversation: ${error.message}`);
      throw new Error(`Failed to start cross-channel conversation: ${error.message}`);
    }
  }

  /**
   * Add a channel to an existing cross-channel conversation
   * @param conversationId Cross-channel conversation ID
   * @param channelId New channel ID
   * @param conversationIdInChannel Conversation ID in the new channel
   * @returns Updated cross-channel conversation
   */
  addChannelToConversation(
    conversationId: string,
    channelId: string,
    conversationIdInChannel: string,
  ): CrossChannelConversation {
    try {
      const conversation = this.conversations.get(conversationId);
      
      if (!conversation) {
        throw new Error(`Cross-channel conversation ${conversationId} not found`);
      }

      if (!conversation.isActive) {
        throw new Error(`Cross-channel conversation ${conversationId} is not active`);
      }

      // End the previous active channel
      const previousChannel = conversation.channels.find(channel => channel.isActive);
      if (previousChannel) {
        previousChannel.isActive = false;
        previousChannel.endedAt = new Date();
      }

      // Add the new channel
      conversation.channels.push({
        channelId,
        conversationId: conversationIdInChannel,
        startedAt: new Date(),
        isActive: true,
      });

      conversation.updatedAt = new Date();
      this.conversations.set(conversationId, conversation);

      // Record the transition
      this.recordTransition(conversationId, previousChannel?.channelId || '', channelId, 'channel_switch');

      this.logger.log(`Added channel ${channelId} to cross-channel conversation ${conversationId}`);
      return conversation;
    } catch (error) {
      this.logger.error(`Failed to add channel to conversation: ${error.message}`);
      throw new Error(`Failed to add channel to conversation: ${error.message}`);
    }
  }

  /**
   * Get a cross-channel conversation
   * @param conversationId Cross-channel conversation ID
   * @returns Cross-channel conversation
   */
  getCrossChannelConversation(conversationId: string): CrossChannelConversation | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Get all cross-channel conversations for a recipient
   * @param recipientId Recipient identifier
   * @returns Array of cross-channel conversations
   */
  getConversationsForRecipient(recipientId: string): CrossChannelConversation[] {
    const result: CrossChannelConversation[] = [];
    
    for (const conversation of this.conversations.values()) {
      if (conversation.recipientId === recipientId) {
        result.push(conversation);
      }
    }
    
    return result;
  }

  /**
   * End a cross-channel conversation
   * @param conversationId Cross-channel conversation ID
   * @returns Boolean indicating success
   */
  endCrossChannelConversation(conversationId: string): boolean {
    try {
      const conversation = this.conversations.get(conversationId);
      
      if (!conversation) {
        return false;
      }

      conversation.isActive = false;
      conversation.updatedAt = new Date();
      
      // End all active channels
      conversation.channels.forEach(channel => {
        if (channel.isActive) {
          channel.isActive = false;
          channel.endedAt = new Date();
        }
      });

      this.conversations.set(conversationId, conversation);
      this.logger.log(`Ended cross-channel conversation ${conversationId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to end cross-channel conversation: ${error.message}`);
      return false;
    }
  }

  /**
   * Record a conversation transition
   * @param conversationId Cross-channel conversation ID
   * @param fromChannel Source channel
   * @param toChannel Target channel
   * @param reason Reason for transition
   * @param metadata Additional metadata
   */
  recordTransition(
    conversationId: string,
    fromChannel: string,
    toChannel: string,
    reason: string,
    metadata?: any,
  ): void {
    try {
      if (!this.transitions.has(conversationId)) {
        this.transitions.set(conversationId, []);
      }

      const transitions = this.transitions.get(conversationId)!;
      transitions.push({
        fromChannel,
        toChannel,
        reason,
        timestamp: new Date(),
        metadata,
      });

      this.transitions.set(conversationId, transitions);
      this.logger.log(`Recorded transition from ${fromChannel} to ${toChannel} for conversation ${conversationId}`);
    } catch (error) {
      this.logger.error(`Failed to record transition: ${error.message}`);
    }
  }

  /**
   * Get conversation transitions
   * @param conversationId Cross-channel conversation ID
   * @returns Array of conversation transitions
   */
  getTransitions(conversationId: string): ConversationTransition[] {
    return this.transitions.get(conversationId) || [];
  }

  /**
   * Find an active cross-channel conversation for a recipient
   * @param recipientId Recipient identifier
   * @returns Active cross-channel conversation or null
   */
  findActiveConversationForRecipient(recipientId: string): CrossChannelConversation | null {
    for (const conversation of this.conversations.values()) {
      if (conversation.recipientId === recipientId && conversation.isActive) {
        return conversation;
      }
    }
    return null;
  }

  /**
   * Generate a unique conversation ID
   * @param recipientId Recipient identifier
   * @returns Unique conversation ID
   */
  private generateConversationId(recipientId: string): string {
    return `cc-${recipientId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a context ID
   * @param recipientId Recipient identifier
   * @returns Context ID
   */
  private generateContextId(recipientId: string): string {
    return `ctx-${recipientId}`;
  }
}