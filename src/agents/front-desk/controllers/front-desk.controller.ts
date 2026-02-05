import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FrontDeskService } from '../services/front-desk.service';
import { FrontDeskRequestDto } from '../dto/front-desk-request.dto';
import { IntegrationActivationDto } from '../dto/integration-activation.dto';
import { ContextCompressionService } from '../services/context-compression.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('front-desk')
@Controller('agents/front-desk')
export class FrontDeskController {
  constructor(
    private readonly frontDeskService: FrontDeskService,
    private readonly contextCompressionService: ContextCompressionService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Process user message',
    description: 'Analyze user message and route to appropriate agent',
  })
  @ApiBody({
    description: 'User message and context',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Quiero un video corto para TikTok sobre mi producto nuevo',
        },
        context: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'user-session-123' },
            language: { type: 'string', example: 'es' },
          },
        },
      },
      required: ['message'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed message',
    schema: {
      type: 'object',
      properties: {
        agent: { type: 'string', example: 'front-desk' },
        status: { type: 'string', example: 'ready' },
        conversation: {
          type: 'object',
          properties: {
            userMessage: { type: 'string' },
            agentResponse: { type: 'string' },
            objective: { type: 'string' },
            targetAgent: { type: 'string' },
            collectedInfo: { type: 'object' },
            missingInfo: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  async processMessage(@Body() body: FrontDeskRequestDto) {
    return this.frontDeskService.processMessage(body.message, body.context);
  }

  @Post('integrations')
  @ApiOperation({
    summary: 'Activate external platform integration',
    description:
      'Activate connection with external platform based on user intent',
  })
  @ApiBody({
    description: 'Integration activation parameters',
    type: IntegrationActivationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Integration activation result',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        integrationId: { type: 'string', example: 'integration-123' },
        platformResponse: { type: 'object' },
      },
    },
  })
  async activateIntegration(@Body() body: IntegrationActivationDto) {
    try {
      // In a real implementation, this would call actual integration services
      // For now, returning mock data with proper validation
      const integrationId = `integration-${Date.now()}`;

      // Simulate integration processing
      const platformResponse = await this.simulatePlatformIntegration(
        body.platform,
        body.action,
        body.payload,
      );

      return {
        status: 'success',
        integrationId,
        platformResponse: {
          message: `Integration with ${body.platform} for action ${body.action} has been initiated`,
          sessionId: body.sessionId,
          ...platformResponse,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to activate integration: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get agent status and metrics',
    description:
      'Retrieve status information and metrics for all specialized agents',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent status and metrics',
    schema: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        agents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              status: { type: 'string' },
              activeTasks: { type: 'number' },
              completedTasks: { type: 'number' },
              failedTasks: { type: 'number' },
              avgResponseTime: { type: 'number' },
              uptime: { type: 'number' },
            },
          },
        },
        system: {
          type: 'object',
          properties: {
            totalConversations: { type: 'number' },
            activeConversations: { type: 'number' },
            avgConversationLength: { type: 'number' },
          },
        },
      },
    },
  })
  async getAgentStatus() {
    return this.frontDeskService.getAgentStatus();
  }

  @Get('integrations/status')
  @ApiOperation({
    summary: 'Get integration status',
    description: 'Check the status of external platform integrations',
  })
  @ApiResponse({
    status: 200,
    description: 'Integration status information',
    schema: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        integrations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              status: { type: 'string' },
              lastChecked: { type: 'string', format: 'date-time' },
              connectedAccounts: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getIntegrationStatus() {
    try {
      // In a real implementation, this would call actual integration services
      // For now, returning mock data with more realistic structure
      const integrations = [
        {
          platform: 'google',
          status: 'operational',
          lastChecked: new Date().toISOString(),
          connectedAccounts: 0,
        },
        {
          platform: 'tiktok',
          status: 'operational',
          lastChecked: new Date().toISOString(),
          connectedAccounts: 0,
        },
        {
          platform: 'meta',
          status: 'operational',
          lastChecked: new Date().toISOString(),
          connectedAccounts: 0,
        },
      ];

      return {
        timestamp: new Date().toISOString(),
        integrations,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve integration status: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all conversations',
    description: 'Retrieve all front desk conversations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
  })
  async getAllConversations() {
    return this.frontDeskService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get conversation by ID',
    description: 'Retrieve a specific conversation by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation details',
  })
  async getConversationById(@Param('id') id: string) {
    return this.frontDeskService.findOne(id);
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get conversations by session',
    description: 'Retrieve all conversations for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of session conversations',
  })
  async getConversationsBySession(@Param('sessionId') sessionId: string) {
    return this.frontDeskService.findBySession(sessionId);
  }

  @Get('context/:sessionId')
  @ApiOperation({
    summary: 'Get compressed context for a session',
    description:
      'Retrieve compressed context and key information for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Compressed context information',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        contextSummary: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            keyPoints: { type: 'array', items: { type: 'string' } },
            lastObjective: { type: 'string' },
            completionStatus: {
              type: 'string',
              enum: ['complete', 'incomplete'],
            },
          },
        },
        keyContext: {
          type: 'object',
          properties: {
            objective: { type: 'string' },
            targetAgent: { type: 'string' },
            collectedInfo: { type: 'object' },
            confidence: { type: 'number' },
          },
        },
      },
    },
  })
  async getSessionContext(@Param('sessionId') sessionId: string) {
    const conversations = await this.frontDeskService.findBySession(sessionId);
    const compressedHistory =
      this.contextCompressionService.compressConversationHistory(conversations);

    return {
      sessionId,
      contextSummary:
        this.contextCompressionService.generateContextSummary(
          compressedHistory,
        ),
      keyContext:
        this.contextCompressionService.extractKeyContext(compressedHistory),
    };
  }

  @Get('suggestions/:sessionId')
  @ApiOperation({
    summary: 'Get next step suggestions',
    description:
      'Suggest the next step in the conversation based on current context and available agents',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Next step suggestions',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: { type: 'string' },
              description: { type: 'string' },
              confidence: { type: 'number' },
              requiredInfo: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        availableAgents: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getNextStepSuggestions(@Param('sessionId') sessionId: string) {
    const conversations = await this.frontDeskService.findBySession(sessionId);
    const compressedHistory =
      this.contextCompressionService.compressConversationHistory(conversations);
    const keyContext =
      this.contextCompressionService.extractKeyContext(compressedHistory);

    // Generate suggestions based on current context
    const suggestions = this.generateContextualSuggestions(keyContext);
    const availableAgents = [
      'video-scriptor',
      'post-scheduler',
      'trend-scanner',
      'faq-responder',
      'analytics-reporter',
    ];

    return {
      sessionId,
      suggestions,
      availableAgents,
    };
  }

  private generateContextualSuggestions(keyContext: any): any[] {
    const suggestions: any[] = [];

    // If we don't have an objective, suggest identifying one
    if (!keyContext.objective || keyContext.objective === 'unknown') {
      suggestions.push({
        action: 'identify_objective',
        description: 'Identify what you want to create or analyze',
        confidence: 0.9,
        requiredInfo: ['objective'],
      });
    }

    // If we have an objective but missing info, suggest collecting it
    if (keyContext.objective && keyContext.objective !== 'unknown') {
      // This would be more sophisticated in a real implementation
      suggestions.push({
        action: 'collect_info',
        description: 'Collect more information about your request',
        confidence: 0.8,
        requiredInfo: ['details'],
      });
    }

    // If we have enough info, suggest routing to an agent
    if (keyContext.targetAgent) {
      suggestions.push({
        action: 'route_to_agent',
        description: `Route to ${keyContext.targetAgent} agent for processing`,
        confidence: 0.95,
        requiredInfo: [],
      });
    }

    // If no suggestions were generated, provide a generic one
    if (suggestions.length === 0) {
      suggestions.push({
        action: 'continue_conversation',
        description: 'Continue the conversation to gather more context',
        confidence: 0.5,
        requiredInfo: ['user_input'],
      });
    }

    return suggestions;
  }

  /**
   * Simulate platform integration for external services
   * In a real implementation, this would connect to actual APIs
   */
  private async simulatePlatformIntegration(
    platform: string,
    action: string,
    payload?: Record<string, any>,
  ): Promise<any> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock responses based on platform and action
    switch (platform) {
      case 'google':
        return {
          campaignId: `campaign-${Date.now()}`,
          status: 'created',
          message: `Google Ads campaign created successfully for action: ${action}`,
        };

      case 'tiktok':
        return {
          videoId: `video-${Date.now()}`,
          status: 'scheduled',
          message: `TikTok video scheduled successfully for action: ${action}`,
        };

      case 'meta':
        return {
          postId: `post-${Date.now()}`,
          status: 'scheduled',
          message: `Meta post scheduled successfully for action: ${action}`,
        };

      default:
        return {
          status: 'unknown_platform',
          message: `Unsupported platform: ${platform}`,
        };
    }
  }
}
