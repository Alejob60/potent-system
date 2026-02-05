import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ConversationContinuityService, CrossChannelConversation } from './conversation-continuity.service';

@ApiTags('Conversation Continuity')
@Controller('continuity')
export class ConversationContinuityController {
  constructor(private readonly continuityService: ConversationContinuityService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a cross-channel conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string', example: '+1234567890' },
        initialChannel: { type: 'string', example: 'whatsapp' },
        initialConversationId: { type: 'string', example: 'conv-123' },
        tenantId: { type: 'string', example: 'tenant-456' },
        contextId: { type: 'string', example: 'ctx-789' },
      },
      required: ['recipientId', 'initialChannel', 'initialConversationId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Cross-channel conversation started successfully',
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
  async startCrossChannelConversation(
    @Body('recipientId') recipientId: string,
    @Body('initialChannel') initialChannel: string,
    @Body('initialConversationId') initialConversationId: string,
    @Body('tenantId') tenantId?: string,
    @Body('contextId') contextId?: string,
  ) {
    try {
      const data = this.continuityService.startCrossChannelConversation(
        recipientId,
        initialChannel,
        initialConversationId,
        tenantId,
        contextId,
      );
      return {
        success: true,
        data,
        message: 'Cross-channel conversation started successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to start cross-channel conversation',
      };
    }
  }

  @Post('add-channel/:conversationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a channel to an existing cross-channel conversation' })
  @ApiParam({
    name: 'conversationId',
    required: true,
    type: 'string',
    example: 'cc-1234567890-1234567890123-abc123def456',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channelId: { type: 'string', example: 'facebook' },
        conversationIdInChannel: { type: 'string', example: 'conv-456' },
      },
      required: ['channelId', 'conversationIdInChannel'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Channel added to cross-channel conversation successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addChannelToConversation(
    @Param('conversationId') conversationId: string,
    @Body('channelId') channelId: string,
    @Body('conversationIdInChannel') conversationIdInChannel: string,
  ) {
    try {
      const data = this.continuityService.addChannelToConversation(
        conversationId,
        channelId,
        conversationIdInChannel,
      );
      return {
        success: true,
        data,
        message: 'Channel added to cross-channel conversation successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Conversation not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to add channel to cross-channel conversation',
      };
    }
  }

  @Get(':conversationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a cross-channel conversation' })
  @ApiParam({
    name: 'conversationId',
    required: true,
    type: 'string',
    example: 'cc-1234567890-1234567890123-abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Cross-channel conversation retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCrossChannelConversation(@Param('conversationId') conversationId: string) {
    try {
      const data = this.continuityService.getCrossChannelConversation(conversationId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Cross-channel conversation retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Conversation not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve cross-channel conversation',
      };
    }
  }

  @Get('recipient/:recipientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all cross-channel conversations for a recipient' })
  @ApiParam({
    name: 'recipientId',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Cross-channel conversations retrieved successfully',
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
  async getConversationsForRecipient(@Param('recipientId') recipientId: string) {
    try {
      const data = this.continuityService.getConversationsForRecipient(recipientId);
      return {
        success: true,
        data,
        message: 'Cross-channel conversations retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve cross-channel conversations',
      };
    }
  }

  @Post('end/:conversationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End a cross-channel conversation' })
  @ApiParam({
    name: 'conversationId',
    required: true,
    type: 'string',
    example: 'cc-1234567890-1234567890123-abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Cross-channel conversation ended successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async endCrossChannelConversation(@Param('conversationId') conversationId: string) {
    try {
      const result = this.continuityService.endCrossChannelConversation(conversationId);
      
      if (result) {
        return {
          success: true,
          message: 'Cross-channel conversation ended successfully',
        };
      } else {
        return {
          success: false,
          message: 'Conversation not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to end cross-channel conversation',
      };
    }
  }

  @Get('transitions/:conversationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get conversation transitions' })
  @ApiParam({
    name: 'conversationId',
    required: true,
    type: 'string',
    example: 'cc-1234567890-1234567890123-abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation transitions retrieved successfully',
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
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTransitions(@Param('conversationId') conversationId: string) {
    try {
      const data = this.continuityService.getTransitions(conversationId);
      return {
        success: true,
        data,
        message: 'Conversation transitions retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve conversation transitions',
      };
    }
  }

  @Get('active/:recipientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find an active cross-channel conversation for a recipient' })
  @ApiParam({
    name: 'recipientId',
    required: true,
    type: 'string',
    example: '+1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Active cross-channel conversation retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'No active conversation found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findActiveConversationForRecipient(@Param('recipientId') recipientId: string) {
    try {
      const data = this.continuityService.findActiveConversationForRecipient(recipientId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Active cross-channel conversation retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'No active conversation found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve active cross-channel conversation',
      };
    }
  }
}