import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface IAOrchestratorConfig {
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  channelId?: string;
  channelType?: string;
}

export interface AgentResponse {
  id: string;
  response: string;
  agentId: string;
  confidence: number;
  timestamp: Date;
  suggestedActions?: string[];
}

@Injectable()
export class IAOrchestratorService {
  private readonly logger = new Logger(IAOrchestratorService.name);
  private readonly config: IAOrchestratorConfig;
  private chatHistory: Map<string, ChatMessage[]> = new Map();

  constructor(private readonly httpService: HttpService) {
    // Default configuration - in a real implementation, this would come from environment variables
    this.config = {
      baseUrl: process.env.MISYBOT_ORCHESTRATOR_URL || 'https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net',
      apiKey: process.env.MISYBOT_ORCHESTRATOR_API_KEY,
      clientId: process.env.MISYBOT_ORCHESTRATOR_CLIENT_ID,
    };
  }

  /**
   * Process a message through the IA Orchestrator
   * @param message User message
   * @param sessionId Session identifier
   * @param channelId Channel identifier (optional)
   * @param channelType Channel type (optional)
   * @returns Agent response
   */
  async processMessage(
    message: string,
    sessionId: string,
    channelId?: string,
    channelType?: string
  ): Promise<AgentResponse> {
    try {
      this.logger.log(`Processing message for session ${sessionId}: ${message}`);

      // Add message to chat history
      const chatMessages = this.chatHistory.get(sessionId) || [];
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        content: message,
        sender: 'user',
        timestamp: new Date(),
        channelId,
        channelType,
      };
      chatMessages.push(userMessage);
      this.chatHistory.set(sessionId, chatMessages);

      // Prepare payload for IA Orchestrator
      const payload = {
        message,
        sessionId,
        context: {
          channelId,
          channelType,
          history: chatMessages.slice(-10), // Last 10 messages
        },
      };

      // Headers for the request
      const headers: any = {
        'Content-Type': 'application/json',
      };

      // Add authentication if configured
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      if (this.config.clientId) {
        headers['X-Client-ID'] = this.config.clientId;
      }

      // Send request to IA Orchestrator
      const response = await firstValueFrom(
        this.httpService.post(`${this.config.baseUrl}/api/orchestrator/process`, payload, { headers })
      );

      const agentResponse: AgentResponse = {
        id: `resp_${Date.now()}`,
        response: response.data.response || response.data.message || 'No response from orchestrator',
        agentId: response.data.agentId || 'unknown',
        confidence: response.data.confidence || 0.8,
        timestamp: new Date(),
        suggestedActions: response.data.suggestedActions,
      };

      // Add response to chat history
      chatMessages.push({
        id: agentResponse.id,
        content: agentResponse.response,
        sender: 'agent',
        timestamp: agentResponse.timestamp,
        channelId,
        channelType,
      });
      this.chatHistory.set(sessionId, chatMessages);

      this.logger.log(`Processed message for session ${sessionId} with agent ${agentResponse.agentId}`);
      return agentResponse;
    } catch (error) {
      this.logger.error(`Failed to process message for session ${sessionId}:`, error.message);
      
      // Return a fallback response
      return {
        id: `error_${Date.now()}`,
        response: 'Lo siento, estoy teniendo dificultades para procesar tu solicitud en este momento. Por favor intenta de nuevo.',
        agentId: 'error-handler',
        confidence: 0.1,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get chat history for a session
   * @param sessionId Session identifier
   * @returns Chat history
   */
  getChatHistory(sessionId: string): ChatMessage[] {
    return this.chatHistory.get(sessionId) || [];
  }

  /**
   * Clear chat history for a session
   * @param sessionId Session identifier
   */
  clearChatHistory(sessionId: string): void {
    this.chatHistory.delete(sessionId);
  }

  /**
   * Get analytics data from the IA Orchestrator
   * @param sessionId Session identifier
   * @returns Analytics data
   */
  async getAnalytics(sessionId: string): Promise<any> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.config.baseUrl}/api/analytics/${sessionId}`, { headers })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get analytics for session ${sessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Send feedback to the IA Orchestrator
   * @param sessionId Session identifier
   * @param messageId Message identifier
   * @param feedback Feedback (positive/negative)
   * @param comment Optional comment
   * @returns Feedback result
   */
  async sendFeedback(
    sessionId: string,
    messageId: string,
    feedback: 'positive' | 'negative',
    comment?: string
  ): Promise<any> {
    try {
      const payload = {
        sessionId,
        messageId,
        feedback,
        comment,
      };

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.config.baseUrl}/api/feedback`, payload, { headers })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send feedback for session ${sessionId}:`, error.message);
      throw error;
    }
  }
}