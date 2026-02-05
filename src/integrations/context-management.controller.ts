import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ContextManagementService, ConversationContext, ContextUpdate } from './context-management.service';

@ApiTags('Context Management')
@Controller('context')
export class ContextManagementController {
  constructor(private readonly contextService: ContextManagementService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation context' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channelId: { type: 'string', example: 'whatsapp' },
        recipientId: { type: 'string', example: '+1234567890' },
        tenantId: { type: 'string', example: 'tenant-123' },
        sessionId: { type: 'string', example: 'session-456' },
      },
      required: ['channelId', 'recipientId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Conversation context created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createContext(
    @Body('channelId') channelId: string,
    @Body('recipientId') recipientId: string,
    @Body('tenantId') tenantId?: string,
    @Body('sessionId') sessionId?: string,
  ) {
    try {
      const data = this.contextService.createContext(channelId, recipientId, tenantId, sessionId);
      return {
        success: true,
        data,
        message: 'Conversation context created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create conversation context',
      };
    }
  }

  @Get(':channelId/:recipientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an existing conversation context' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiParam({
    name: 'recipientId',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation context retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Context not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getContext(
    @Param('channelId') channelId: string,
    @Param('recipientId') recipientId: string,
  ) {
    try {
      const data = this.contextService.getContext(channelId, recipientId);
      return {
        success: true,
        data,
        message: 'Conversation context retrieved successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Context not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve conversation context',
      };
    }
  }

  @Post('update/:channelId/:recipientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing conversation context' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiParam({
    name: 'recipientId',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        variables: {
          type: 'object',
          example: { name: 'John', orderNumber: '12345' },
        },
        language: { type: 'string', example: 'en' },
        timezone: { type: 'string', example: 'UTC' },
        appendToHistory: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'msg-123' },
            timestamp: { type: 'string', example: '2023-01-01T00:00:00Z' },
            direction: { type: 'string', example: 'outbound' },
            content: { type: 'string', example: 'Hello John!' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation context updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Context not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateContext(
    @Param('channelId') channelId: string,
    @Param('recipientId') recipientId: string,
    @Body() updates: ContextUpdate,
  ) {
    try {
      const data = this.contextService.updateContext(channelId, recipientId, updates);
      return {
        success: true,
        data,
        message: 'Conversation context updated successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Context not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to update conversation context',
      };
    }
  }

  @Delete(':channelId/:recipientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a conversation context' })
  @ApiParam({
    name: 'channelId',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiParam({
    name: 'recipientId',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation context deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Context not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteContext(
    @Param('channelId') channelId: string,
    @Param('recipientId') recipientId: string,
  ) {
    try {
      const result = this.contextService.deleteContext(channelId, recipientId);
      
      if (result) {
        return {
          success: true,
          message: 'Conversation context deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Context not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete conversation context',
      };
    }
  }

  @Get('recipient/:recipientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all contexts for a recipient across all channels' })
  @ApiParam({
    name: 'recipientId',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation contexts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getContextsForRecipient(@Param('recipientId') recipientId: string) {
    try {
      const data = this.contextService.getContextsForRecipient(recipientId);
      return {
        success: true,
        data,
        message: 'Conversation contexts retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve conversation contexts',
      };
    }
  }

  @Post('clear-expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear expired contexts' })
  @ApiQuery({
    name: 'maxAge',
    required: false,
    type: 'number',
    example: 86400000,
  })
  @ApiResponse({
    status: 200,
    description: 'Expired contexts cleared successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async clearExpiredContexts(@Query('maxAge') maxAge?: number) {
    try {
      const data = this.contextService.clearExpiredContexts(maxAge);
      return {
        success: true,
        data,
        message: `Cleared ${data} expired contexts`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to clear expired contexts',
      };
    }
  }
}