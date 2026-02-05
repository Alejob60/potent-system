import { Controller, Post, Get, Put, Param, Body, Logger } from '@nestjs/common';
import { ColombiaTICAgentService } from './colombiatic-agent.service';
import type { ColombiaTICAgentConfig } from './colombiatic-agent.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('colombiatic')
@Controller('colombiatic')
export class ColombiaTICAgentController {
  private readonly logger = new Logger(ColombiaTICAgentController.name);

  constructor(private readonly agentService: ColombiaTICAgentService) {}

  @Post('agent/create')
  @ApiOperation({
    summary: 'Create new ColombiaTIC AI Agent',
    description: 'Create a new AI agent for ColombiaTIC with specified configuration',
  })
  @ApiBody({
    description: 'Agent configuration parameters',
    schema: {
      type: 'object',
      properties: {
        siteUrl: { type: 'string', example: 'https://example.com' },
        industry: { type: 'string', example: 'technology' },
        language: { type: 'string', example: 'es' },
        tone: { type: 'string', example: 'professional' },
        connectChannels: {
          type: 'array',
          items: { type: 'string' },
          example: ['facebook', 'whatsapp', 'google-ads'],
        },
      },
      required: ['siteUrl', 'industry', 'language', 'tone', 'connectChannels'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Agent created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        config: {
          type: 'object',
          properties: {
            siteUrl: { type: 'string' },
            industry: { type: 'string' },
            language: { type: 'string' },
            tone: { type: 'string' },
            connectChannels: { type: 'array', items: { type: 'string' } },
          },
        },
        clientId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  async createAgent(@Body() config: ColombiaTICAgentConfig) {
    try {
      const agent = await this.agentService.createAgent(config);
      return {
        success: true,
        agent,
        chatWidgetScript: this.agentService.generateChatWidgetScript(agent.clientId),
      };
    } catch (error) {
      this.logger.error('Failed to create agent:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('agent/:id')
  @ApiOperation({
    summary: 'Get agent configuration',
    description: 'Retrieve configuration and details for a specific ColombiaTIC agent',
  })
  @ApiParam({
    name: 'id',
    description: 'Agent ID',
    example: 'agent_1234567890_abcde',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agent details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        config: {
          type: 'object',
          properties: {
            siteUrl: { type: 'string' },
            industry: { type: 'string' },
            language: { type: 'string' },
            tone: { type: 'string' },
            connectChannels: { type: 'array', items: { type: 'string' } },
          },
        },
        clientId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgent(@Param('id') id: string) {
    try {
      const agent = this.agentService.getAgent(id);
      if (!agent) {
        return {
          success: false,
          error: 'Agent not found',
        };
      }

      return {
        success: true,
        agent,
      };
    } catch (error) {
      this.logger.error(`Failed to get agent ${id}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put('agent/:id')
  @ApiOperation({
    summary: 'Update agent configuration',
    description: 'Update configuration for a specific ColombiaTIC agent',
  })
  @ApiParam({
    name: 'id',
    description: 'Agent ID',
    example: 'agent_1234567890_abcde',
  })
  @ApiBody({
    description: 'Partial agent configuration parameters',
    schema: {
      type: 'object',
      properties: {
        siteUrl: { type: 'string', example: 'https://example.com' },
        industry: { type: 'string', example: 'technology' },
        language: { type: 'string', example: 'es' },
        tone: { type: 'string', example: 'professional' },
        connectChannels: {
          type: 'array',
          items: { type: 'string' },
          example: ['facebook', 'whatsapp', 'google-ads'],
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Agent updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        config: {
          type: 'object',
          properties: {
            siteUrl: { type: 'string' },
            industry: { type: 'string' },
            language: { type: 'string' },
            tone: { type: 'string' },
            connectChannels: { type: 'array', items: { type: 'string' } },
          },
        },
        clientId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async updateAgent(@Param('id') id: string, @Body() config: Partial<ColombiaTICAgentConfig>) {
    try {
      const agent = await this.agentService.updateAgent(id, config);
      return {
        success: true,
        agent,
      };
    } catch (error) {
      this.logger.error(`Failed to update agent ${id}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('agent/:id/webhooks')
  @ApiOperation({
    summary: 'Configure webhooks',
    description: 'Configure webhooks for a specific ColombiaTIC agent',
  })
  @ApiParam({
    name: 'id',
    description: 'Agent ID',
    example: 'agent_1234567890_abcde',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhooks configured successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        webhooks: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async configureWebhooks(@Param('id') id: string) {
    try {
      const agent = this.agentService.getAgent(id);
      if (!agent) {
        return {
          success: false,
          error: 'Agent not found',
        };
      }

      const webhookConfig = this.agentService.getWebhookConfiguration(id);
      return {
        success: true,
        webhooks: webhookConfig,
      };
    } catch (error) {
      this.logger.error(`Failed to configure webhooks for agent ${id}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('agent/:id/webhooks')
  @ApiOperation({
    summary: 'Get webhook configuration',
    description: 'Retrieve webhook configuration for a specific ColombiaTIC agent',
  })
  @ApiParam({
    name: 'id',
    description: 'Agent ID',
    example: 'agent_1234567890_abcde',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        webhooks: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getWebhookConfiguration(@Param('id') id: string) {
    try {
      const agent = this.agentService.getAgent(id);
      if (!agent) {
        return {
          success: false,
          error: 'Agent not found',
        };
      }

      const webhookConfig = this.agentService.getWebhookConfiguration(id);
      return {
        success: true,
        webhooks: webhookConfig,
      };
    } catch (error) {
      this.logger.error(`Failed to get webhook configuration for agent ${id}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}