import { Injectable } from '@nestjs/common';
import { FrontDeskConversation } from '../entities/front-desk-conversation.entity';

@Injectable()
export class ContextCompressionService {
  /**
   * Compresses conversation history to maintain relevant context while reducing storage size
   * @param conversations Array of conversation history
   * @param maxContextLength Maximum number of conversations to keep
   * @returns Compressed conversation context
   */
  compressConversationHistory(
    conversations: FrontDeskConversation[],
    maxContextLength = 5,
  ): FrontDeskConversation[] {
    // Sort conversations by timestamp (newest first)
    const sortedConversations = [...conversations].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Take only the most recent conversations up to maxContextLength
    const recentConversations = sortedConversations.slice(0, maxContextLength);

    // Further compress by summarizing older conversations if needed
    if (recentConversations.length > 3) {
      return this.summarizeOlderConversations(recentConversations);
    }

    return recentConversations;
  }

  /**
   * Summarizes older conversations to preserve key information while reducing data size
   * @param conversations Array of conversations to summarize
   * @returns Array with summarized older conversations
   */
  private summarizeOlderConversations(
    conversations: FrontDeskConversation[],
  ): FrontDeskConversation[] {
    // Keep the most recent 2 conversations in full detail
    const detailedConversations = conversations.slice(0, 2);

    // Summarize the remaining conversations
    const summarizedConversations = conversations.slice(2).map((conv) => ({
      ...conv,
      userMessage: this.summarizeText(conv.userMessage, 50),
      agentResponse: this.summarizeText(conv.agentResponse, 50),
      collectedInfo: this.compressCollectedInfo(conv.collectedInfo),
    }));

    return [...detailedConversations, ...summarizedConversations];
  }

  /**
   * Summarizes text content to a specified maximum length
   * @param text Text to summarize
   * @param maxLength Maximum length of the summary
   * @returns Summarized text
   */
  private summarizeText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Simple truncation with ellipsis for now
    // In a more advanced implementation, this could use AI to generate actual summaries
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Compresses collected information by removing redundant or less important data
   * @param info Collected information object
   * @returns Compressed information object
   */
  private compressCollectedInfo(info: any): any {
    if (!info) return info;

    // Create a shallow copy to avoid modifying the original
    const compressedInfo = { ...info };

    // Remove any empty or null values
    Object.keys(compressedInfo).forEach((key) => {
      if (
        compressedInfo[key] === null ||
        compressedInfo[key] === undefined ||
        compressedInfo[key] === ''
      ) {
        delete compressedInfo[key];
      }
    });

    return compressedInfo;
  }

  /**
   * Extracts key context from conversation history for efficient routing
   * @param conversations Conversation history
   * @returns Key context information
   */
  extractKeyContext(conversations: FrontDeskConversation[]): {
    objective: string;
    targetAgent: string;
    collectedInfo: any;
    confidence: number;
    emotion: string;
    entities: any;
    context: any;
  } {
    if (conversations.length === 0) {
      return {
        objective: '',
        targetAgent: '',
        collectedInfo: {},
        confidence: 0,
        emotion: '',
        entities: {},
        context: {},
      };
    }

    // Get the most recent conversation as the primary context
    const latestConversation = conversations[0];

    return {
      objective: latestConversation.objective,
      targetAgent: latestConversation.targetAgent,
      collectedInfo: latestConversation.collectedInfo,
      confidence: latestConversation.confidence || 0,
      emotion: latestConversation.emotion || '',
      entities: latestConversation.entities || {},
      context: latestConversation.context || {},
    };
  }

  /**
   * Generates a compressed context summary for efficient storage and retrieval
   * @param conversations Full conversation history
   * @returns Compressed context summary
   */
  generateContextSummary(conversations: FrontDeskConversation[]): {
    summary: string;
    keyPoints: string[];
    lastObjective: string;
    completionStatus: 'complete' | 'incomplete';
    emotion: string;
    entities: any;
  } {
    if (conversations.length === 0) {
      return {
        summary: 'No conversation history',
        keyPoints: [],
        lastObjective: '',
        completionStatus: 'incomplete',
        emotion: '',
        entities: {},
      };
    }

    // Get the most recent conversation
    const latest = conversations[0];

    // Generate summary based on conversation status
    let summary = '';
    const keyPoints: string[] = [];

    if (latest.objective) {
      summary += `Objective: ${latest.objective}. `;
      keyPoints.push(`Objective: ${latest.objective}`);
    }

    if (latest.targetAgent) {
      summary += `Target Agent: ${latest.targetAgent}. `;
      keyPoints.push(`Target Agent: ${latest.targetAgent}`);
    }

    if (latest.missingInfo && latest.missingInfo.length > 0) {
      summary += `Missing Info: ${latest.missingInfo.join(', ')}. `;
      keyPoints.push(`Missing Info: ${latest.missingInfo.join(', ')}`);
    }

    // Add collected information key points
    if (latest.collectedInfo) {
      Object.entries(latest.collectedInfo).forEach(([key, value]) => {
        keyPoints.push(`${key}: ${String(value)}`);
      });
    }

    // Add emotional context
    if (latest.emotion) {
      summary += `Emotion: ${latest.emotion}. `;
      keyPoints.push(`Emotion: ${latest.emotion}`);
    }

    return {
      summary: summary.trim() || 'Conversation in progress',
      keyPoints,
      lastObjective: latest.objective,
      completionStatus: latest.targetAgent ? 'complete' : 'incomplete',
      emotion: latest.emotion || '',
      entities: latest.entities || {},
    };
  }
}
