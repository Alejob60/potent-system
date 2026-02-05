import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ResponseFormattingService, FormattingTemplate, ResponseFormatRule, FormattedResponse } from './response-formatting.service';

@ApiTags('Response Formatting')
@Controller('formatting')
export class ResponseFormattingController {
  constructor(private readonly formattingService: ResponseFormattingService) {}

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a formatting template' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'template-1' },
        name: { type: 'string', example: 'Welcome Message' },
        channel: { type: 'string', example: 'whatsapp' },
        template: { type: 'string', example: 'Hello {{name}}! Welcome to our service.' },
        variables: {
          type: 'array',
          items: { type: 'string' },
          example: ['name'],
        },
      },
      required: ['id', 'name', 'channel', 'template', 'variables'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Formatting template added successfully',
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
  async addTemplate(@Body() template: FormattingTemplate) {
    try {
      this.formattingService.addTemplate(template);
      return {
        success: true,
        message: 'Formatting template added successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add formatting template',
      };
    }
  }

  @Get('templates/:templateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a formatting template' })
  @ApiParam({
    name: 'templateId',
    required: true,
    type: 'string',
    example: 'template-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Formatting template retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTemplate(@Param('templateId') templateId: string) {
    try {
      const data = this.formattingService.getTemplate(templateId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Formatting template retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Template not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve formatting template',
      };
    }
  }

  @Delete('templates/:templateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a formatting template' })
  @ApiParam({
    name: 'templateId',
    required: true,
    type: 'string',
    example: 'template-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Formatting template removed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeTemplate(@Param('templateId') templateId: string) {
    try {
      const result = this.formattingService.removeTemplate(templateId);
      
      if (result) {
        return {
          success: true,
          message: 'Formatting template removed successfully',
        };
      } else {
        return {
          success: false,
          message: 'Template not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove formatting template',
      };
    }
  }

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a response format rule' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'rule-1' },
        name: { type: 'string', example: 'Uppercase for Premium Users' },
        conditions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'context.customerTier' },
              operator: { type: 'string', example: 'equals' },
              value: { type: 'string', example: 'premium' },
            },
          },
        },
        formatter: {
          type: 'object',
          properties: {
            type: { type: 'string', example: 'transformation' },
            transformation: { type: 'string', example: 'uppercase' },
          },
        },
        priority: { type: 'number', example: 1 },
        active: { type: 'boolean', example: true },
      },
      required: ['id', 'name', 'conditions', 'formatter', 'priority', 'active'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Response format rule added successfully',
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
  async addFormatRule(@Body() rule: ResponseFormatRule) {
    try {
      this.formattingService.addFormatRule(rule);
      return {
        success: true,
        message: 'Response format rule added successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add response format rule',
      };
    }
  }

  @Get('rules/:ruleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a response format rule' })
  @ApiParam({
    name: 'ruleId',
    required: true,
    type: 'string',
    example: 'rule-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Response format rule retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFormatRule(@Param('ruleId') ruleId: string) {
    try {
      const data = this.formattingService.getFormatRule(ruleId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Response format rule retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Rule not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve response format rule',
      };
    }
  }

  @Delete('rules/:ruleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a response format rule' })
  @ApiParam({
    name: 'ruleId',
    required: true,
    type: 'string',
    example: 'rule-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Response format rule removed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeFormatRule(@Param('ruleId') ruleId: string) {
    try {
      const result = this.formattingService.removeFormatRule(ruleId);
      
      if (result) {
        return {
          success: true,
          message: 'Response format rule removed successfully',
        };
      } else {
        return {
          success: false,
          message: 'Rule not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove response format rule',
      };
    }
  }

  @Post('format')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Format a response for a specific channel' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channel: { type: 'string', example: 'whatsapp' },
        content: { type: 'string', example: 'Hello, how can I help you?' },
        context: {
          type: 'object',
          example: {
            customerTier: 'premium',
            language: 'en',
          },
        },
      },
      required: ['channel', 'content'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Response formatted successfully',
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
  async formatResponse(
    @Body('channel') channel: string,
    @Body('content') content: string,
    @Body('context') context?: any,
  ) {
    try {
      const data: FormattedResponse = this.formattingService.formatResponse(channel, content, context);
      return {
        success: true,
        data,
        message: 'Response formatted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to format response',
      };
    }
  }

  @Post('format-template/:templateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Format a response using a template' })
  @ApiParam({
    name: 'templateId',
    required: true,
    type: 'string',
    example: 'template-1',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        variables: {
          type: 'object',
          example: { name: 'John', orderNumber: '12345' },
        },
      },
      required: ['variables'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Response formatted with template successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async formatWithTemplate(
    @Param('templateId') templateId: string,
    @Body('variables') variables: Record<string, any>,
  ) {
    try {
      const data = this.formattingService.formatWithTemplate(templateId, variables);
      return {
        success: true,
        data,
        message: 'Response formatted with template successfully',
      };
    } catch (error) {
      if (error.message.includes('not found')) {
        return {
          success: false,
          error: error.message,
          message: 'Template not found',
        };
      }
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to format response with template',
      };
    }
  }

  @Get('templates/channel/:channel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all templates for a channel' })
  @ApiParam({
    name: 'channel',
    required: true,
    type: 'string',
    example: 'whatsapp',
  })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
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
  async getTemplatesForChannel(@Param('channel') channel: string) {
    try {
      const data = this.formattingService.getTemplatesForChannel(channel);
      return {
        success: true,
        data,
        message: 'Templates retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve templates',
      };
    }
  }
}