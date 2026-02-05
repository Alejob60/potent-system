import { Controller, Post, Get, Param, Body, Logger } from '@nestjs/common';
import { IAOrchestratorService, ChatMessage, AgentResponse } from './ia-orchestrator.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('ia-orchestrator')
@Controller('ia-orchestrator')
export class IAOrchestratorController {
  private readonly logger = new Logger(IAOrchestratorController.name);

  constructor(private readonly orchestratorService: IAOrchestratorService) {}

  @Post('process-message')
  @ApiOperation({
    summary: 'Process message through IA Orchestrator',
    description: 'Send a message to the IA Orchestrator for processing and get AI response',
  })
  @ApiBody({
    description: 'Message processing parameters',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Hello, how can you help me?' },
        sessionId: { type: 'string', example: 'session_1234567890' },
        channelId: { type: 'string', example: 'facebook_12345' },
        channelType: { type: 'string', example: 'facebook' },
      },
      required: ['message', 'sessionId'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Message processed successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        response: { type: 'string' },
        agentId: { type: 'string' },
        confidence: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
        suggestedActions: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  async processMessage(@Body() payload: { 
    message: string; 
    sessionId: string; 
    channelId?: string; 
    channelType?: string 
  }): Promise<any> {
    try {
      const response = await this.orchestratorService.processMessage(
        payload.message,
        payload.sessionId,
        payload.channelId,
        payload.channelType
      );
      
      return {
        success: true,
        response,
      };
    } catch (error) {
      this.logger.error(`Failed to process message for session ${payload.sessionId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('chat-history/:sessionId')
  @ApiOperation({
    summary: 'Get chat history',
    description: 'Retrieve chat history for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session identifier',
    example: 'session_1234567890',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          sender: { type: 'string', enum: ['user', 'agent'] },
          timestamp: { type: 'string', format: 'date-time' },
          channelId: { type: 'string' },
          channelType: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getChatHistory(@Param('sessionId') sessionId: string): Promise<any> {
    try {
      const history = this.orchestratorService.getChatHistory(sessionId);
      return {
        success: true,
        history,
      };
    } catch (error) {
      this.logger.error(`Failed to get chat history for session ${sessionId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('clear-history/:sessionId')
  @ApiOperation({
    summary: 'Clear chat history',
    description: 'Clear chat history for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session identifier',
    example: 'session_1234567890',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat history cleared successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async clearChatHistory(@Param('sessionId') sessionId: string): Promise<any> {
    try {
      this.orchestratorService.clearChatHistory(sessionId);
      return {
        success: true,
        message: 'Chat history cleared successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to clear chat history for session ${sessionId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('analytics/:sessionId')
  @ApiOperation({
    summary: 'Get analytics data',
    description: 'Retrieve analytics data for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session identifier',
    example: 'session_1234567890',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Analytics data retrieved successfully',
    schema: {
      type: 'object',
    },
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getAnalytics(@Param('sessionId') sessionId: string): Promise<any> {
    try {
      const analytics = await this.orchestratorService.getAnalytics(sessionId);
      return {
        success: true,
        analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics for session ${sessionId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('feedback')
  @ApiOperation({
    summary: 'Send feedback',
    description: 'Send feedback for a specific message',
  })
  @ApiBody({
    description: 'Feedback parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'session_1234567890' },
        messageId: { type: 'string', example: 'msg_1234567890' },
        feedback: { type: 'string', enum: ['positive', 'negative'], example: 'positive' },
        comment: { type: 'string', example: 'This response was very helpful' },
      },
      required: ['sessionId', 'messageId', 'feedback'],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Feedback sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  async sendFeedback(@Body() payload: { 
    sessionId: string; 
    messageId: string; 
    feedback: 'positive' | 'negative'; 
    comment?: string 
  }): Promise<any> {
    try {
      const result = await this.orchestratorService.sendFeedback(
        payload.sessionId,
        payload.messageId,
        payload.feedback,
        payload.comment
      );
      
      return {
        success: true,
        result,
      };
    } catch (error) {
      this.logger.error(`Failed to send feedback for session ${payload.sessionId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}