import { Controller, Post, Get, Param, Body, Logger, Query } from '@nestjs/common';
import { ColombiaTICOrchestratorService } from './colombiatic-orchestrator.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('colombiatic-orchestrator')
@Controller('colombiatic-orchestrator')
export class ColombiaTICOrchestratorController {
  private readonly logger = new Logger(ColombiaTICOrchestratorController.name);

  constructor(private readonly orchestratorService: ColombiaTICOrchestratorService) {}

  @Post('webhook/:channel')
  @ApiOperation({
    summary: 'Process webhook event',
    description: 'Process webhook event from a specific channel',
  })
  @ApiParam({
    name: 'channel',
    description: 'Channel name',
    example: 'facebook',
  })
  @ApiBody({
    description: 'Webhook event payload',
    schema: {
      type: 'object',
    },
  })
  @ApiQuery({
    name: 'eventType',
    description: 'Event type',
    required: false,
    example: 'message',
  })
  @ApiQuery({
    name: 'agentId',
    description: 'Associated agent ID',
    required: false,
    example: 'agent_1234567890_abcde',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook event processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        eventId: { type: 'string' },
        response: { type: 'object' },
      },
    },
  })
  async processWebhookEvent(
    @Param('channel') channel: string,
    @Query('eventType') eventType: string,
    @Query('agentId') agentId: string,
    @Body() payload: any
  ): Promise<any> {
    try {
      const result = await this.orchestratorService.processWebhookEvent(
        channel,
        eventType,
        payload,
        agentId
      );
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to process webhook event from ${channel}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('webhooks/events')
  @ApiOperation({
    summary: 'Get recent webhook events',
    description: 'Retrieve recent webhook events for monitoring',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of events to return',
    required: false,
    example: 50,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook events retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          agentId: { type: 'string' },
          channel: { type: 'string' },
          eventType: { type: 'string' },
          payload: { type: 'object' },
          processed: { type: 'boolean' },
          response: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getRecentWebhookEvents(@Query('limit') limit?: number): Promise<any> {
    try {
      const events = this.orchestratorService.getRecentWebhookEvents(limit || 50);
      return {
        success: true,
        events,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve webhook events:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('webhooks/events/channel/:channel')
  @ApiOperation({
    summary: 'Get webhook events by channel',
    description: 'Retrieve webhook events for a specific channel',
  })
  @ApiParam({
    name: 'channel',
    description: 'Channel name',
    example: 'facebook',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of events to return',
    required: false,
    example: 50,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook events retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          agentId: { type: 'string' },
          channel: { type: 'string' },
          eventType: { type: 'string' },
          payload: { type: 'object' },
          processed: { type: 'boolean' },
          response: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getWebhookEventsByChannel(
    @Param('channel') channel: string,
    @Query('limit') limit?: number
  ): Promise<any> {
    try {
      const events = this.orchestratorService.getWebhookEventsByChannel(channel, limit || 50);
      return {
        success: true,
        events,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve webhook events for channel ${channel}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('messages')
  @ApiOperation({
    summary: 'Get recent channel messages',
    description: 'Retrieve recent channel messages',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of messages to return',
    required: false,
    example: 50,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Channel messages retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          agentId: { type: 'string' },
          channel: { type: 'string' },
          content: { type: 'string' },
          sender: { type: 'string', enum: ['user', 'agent', 'system'] },
          timestamp: { type: 'string', format: 'date-time' },
          processed: { type: 'boolean' },
          response: { type: 'object' },
        },
      },
    },
  })
  async getRecentChannelMessages(@Query('limit') limit?: number): Promise<any> {
    try {
      const messages = this.orchestratorService.getRecentChannelMessages(limit || 50);
      return {
        success: true,
        messages,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve channel messages:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('messages/channel/:channel')
  @ApiOperation({
    summary: 'Get channel messages by channel',
    description: 'Retrieve channel messages for a specific channel',
  })
  @ApiParam({
    name: 'channel',
    description: 'Channel name',
    example: 'facebook',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of messages to return',
    required: false,
    example: 50,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Channel messages retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          agentId: { type: 'string' },
          channel: { type: 'string' },
          content: { type: 'string' },
          sender: { type: 'string', enum: ['user', 'agent', 'system'] },
          timestamp: { type: 'string', format: 'date-time' },
          processed: { type: 'boolean' },
          response: { type: 'object' },
        },
      },
    },
  })
  async getChannelMessagesByChannel(
    @Param('channel') channel: string,
    @Query('limit') limit?: number
  ): Promise<any> {
    try {
      const messages = this.orchestratorService.getChannelMessagesByChannel(channel, limit || 50);
      return {
        success: true,
        messages,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve channel messages for channel ${channel}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('messages/agent/:agentId')
  @ApiOperation({
    summary: 'Get channel messages by agent',
    description: 'Retrieve channel messages for a specific agent',
  })
  @ApiParam({
    name: 'agentId',
    description: 'Agent ID',
    example: 'agent_1234567890_abcde',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of messages to return',
    required: false,
    example: 50,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Channel messages retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          agentId: { type: 'string' },
          channel: { type: 'string' },
          content: { type: 'string' },
          sender: { type: 'string', enum: ['user', 'agent', 'system'] },
          timestamp: { type: 'string', format: 'date-time' },
          processed: { type: 'boolean' },
          response: { type: 'object' },
        },
      },
    },
  })
  async getChannelMessagesByAgent(
    @Param('agentId') agentId: string,
    @Query('limit') limit?: number
  ): Promise<any> {
    try {
      const messages = this.orchestratorService.getChannelMessagesByAgent(agentId, limit || 50);
      return {
        success: true,
        messages,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve channel messages for agent ${agentId}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}