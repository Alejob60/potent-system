import { Controller, Post, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AzureFoundryIARouterService } from './azure-foundry-ia-router.service';
import { ChatCompletionRequestDto } from './dto/chat-completion-request.dto';
import { ChatCompletionResponseDto } from './dto/chat-completion-response.dto';

export class RouteMessageDto {
  message: string;
  context?: any;
}

export class CompareModelsDto {
  prompt: string;
  models: string[];
}

@Controller('ia-routing')
@ApiTags('IA Routing')
export class IARoutingController {
  private readonly logger = new Logger(IARoutingController.name);

  constructor(private readonly iaRouterService: AzureFoundryIARouterService) {}

  @Post('chat-completion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process a chat completion request through Azure Foundry Model Router' })
  @ApiBody({ type: ChatCompletionRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Successful chat completion response',
    type: ChatCompletionResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async processChatCompletion(
    @Body() request: ChatCompletionRequestDto
  ): Promise<ChatCompletionResponseDto> {
    try {
      this.logger.log('Processing chat completion request');
      const response = await this.iaRouterService.processChatCompletion(request);
      return response;
    } catch (error) {
      this.logger.error(`Failed to process chat completion: ${error.message}`);
      throw error;
    }
  }

  @Post('route-message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Route a message to the most appropriate AI model' })
  @ApiBody({ type: RouteMessageDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully routed message',
    schema: {
      type: 'object',
      properties: {
        routedModel: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async routeMessage(
    @Body() routeMessageDto: RouteMessageDto
  ): Promise<{ routedModel: string }> {
    try {
      this.logger.log(`Routing message: ${routeMessageDto.message.substring(0, 50)}...`);
      const routedModel = await this.iaRouterService.routeMessage(
        routeMessageDto.message, 
        routeMessageDto.context
      );
      return { routedModel };
    } catch (error) {
      this.logger.error(`Failed to route message: ${error.message}`);
      throw error;
    }
  }

  @Post('compare-models')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Compare multiple AI models\' responses to the same prompt' })
  @ApiBody({ type: CompareModelsDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Model comparison results',
    schema: {
      type: 'object',
      properties: {
        results: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              model: { type: 'string' },
              response: { type: 'string' },
              tokensUsed: { type: 'number' },
              processingTime: { type: 'number' }
            }
          }
        },
        evaluation: {
          type: 'object',
          properties: {
            bestModel: { type: 'string' },
            reasoning: { type: 'string' },
            scores: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async compareModels(
    @Body() compareModelsDto: CompareModelsDto
  ): Promise<any> {
    try {
      this.logger.log(`Comparing models for prompt: ${compareModelsDto.prompt.substring(0, 50)}...`);
      const comparisonResult = await this.iaRouterService.compareModels(
        compareModelsDto.prompt,
        compareModelsDto.models
      );
      return comparisonResult;
    } catch (error) {
      this.logger.error(`Failed to compare models: ${error.message}`);
      throw error;
    }
  }

  @Post('rate-limit-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current rate limit status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current rate limit status',
    schema: {
      type: 'object',
      properties: {
        requestsUsed: { type: 'number' },
        requestsLimit: { type: 'number' },
        tokensUsed: { type: 'number' },
        tokensLimit: { type: 'number' },
        resetTime: { type: 'number' }
      }
    }
  })
  async getRateLimitStatus(): Promise<any> {
    try {
      this.logger.log('Getting rate limit status');
      return this.iaRouterService.getRateLimitStatus();
    } catch (error) {
      this.logger.error(`Failed to get rate limit status: ${error.message}`);
      throw error;
    }
  }
}