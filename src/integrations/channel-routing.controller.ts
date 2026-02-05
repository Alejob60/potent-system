import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ChannelRoutingService, RoutingRule, MessageContext } from './channel-routing.service';

@ApiTags('Channel Routing')
@Controller('routing')
export class ChannelRoutingController {
  constructor(private readonly routingService: ChannelRoutingService) {}

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a routing rule' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'rule-1' },
        name: { type: 'string', example: 'High Priority Customers' },
        conditions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'metadata.customerTier' },
              operator: { type: 'string', example: 'equals' },
              value: { type: 'string', example: 'premium' },
            },
          },
        },
        actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'route' },
              channel: { type: 'string', example: 'whatsapp' },
              template: { type: 'string', example: 'premium-customer-template' },
            },
          },
        },
        priority: { type: 'number', example: 1 },
        active: { type: 'boolean', example: true },
      },
      required: ['id', 'name', 'conditions', 'actions', 'priority', 'active'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Routing rule added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addRoutingRule(@Body() rule: RoutingRule) {
    try {
      this.routingService.addRoutingRule(rule);
      return {
        success: true,
        message: 'Routing rule added successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add routing rule',
      };
    }
  }

  @Post('remove-rule/:ruleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a routing rule' })
  @ApiParam({
    name: 'ruleId',
    required: true,
    type: 'string',
    example: 'rule-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Routing rule removed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeRoutingRule(@Param('ruleId') ruleId: string) {
    try {
      this.routingService.removeRoutingRule(ruleId);
      return {
        success: true,
        message: 'Routing rule removed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove routing rule',
      };
    }
  }

  @Get('rules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all routing rules' })
  @ApiResponse({
    status: 200,
    description: 'Routing rules retrieved successfully',
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
  async getRoutingRules() {
    try {
      const data = this.routingService.getRoutingRules();
      return {
        success: true,
        data,
        message: 'Routing rules retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve routing rules',
      };
    }
  }

  @Post('route')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Route a message based on context and rules' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channelId: { type: 'string', example: 'whatsapp' },
        recipient: { type: 'string', example: '+1234567890' },
        message: { type: 'string', example: 'Hello from MisyBot!' },
        metadata: {
          type: 'object',
          example: {
            customerTier: 'premium',
            language: 'en',
          },
        },
      },
      required: ['recipient', 'message'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message routed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            channel: { type: 'string' },
            template: { type: 'string' },
            parameters: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async routeMessage(@Body() context: MessageContext) {
    try {
      const data = this.routingService.routeMessage(context);
      return {
        success: true,
        data,
        message: 'Message routed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to route message',
      };
    }
  }

  @Post('priority/:channel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set channel priority for fallback routing' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        priority: { type: 'number', example: 1 },
      },
      required: ['priority'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Channel priority set successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async setChannelPriority(
    @Param('channel') channel: string,
    @Body('priority') priority: number,
  ) {
    try {
      this.routingService.setChannelPriority(channel, priority);
      return {
        success: true,
        message: 'Channel priority set successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to set channel priority',
      };
    }
  }

  @Get('priorities')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get channel priorities' })
  @ApiResponse({
    status: 200,
    description: 'Channel priorities retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getChannelPriorities() {
    try {
      const data = this.routingService.getChannelPriorities();
      return {
        success: true,
        data: Object.fromEntries(data),
        message: 'Channel priorities retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve channel priorities',
      };
    }
  }
}