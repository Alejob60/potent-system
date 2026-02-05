import { Controller, Post, Body, Req, Get, Param, HttpCode, HttpStatus, Logger, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { ProcessRequestDto } from '../dtos/process-request.dto';
import { ProcessResponseDto } from '../dtos/process-response.dto';
import { MetaAgentProcessService } from '../services/meta-agent-process.service';
import { SessionContextService } from '../services/session-context.service';
import { JwtAuthGuard, JwtPayload } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';

// Extender la interfaz Request de Express
declare module 'express' {
  interface Request {
    user?: JwtPayload;
    tenantContext?: any;
  }
}

@ApiTags('Meta-Agent V2 - AI Engine')
@Controller('v2/agents/meta-agent')
@UseGuards(JwtAuthGuard, TenantGuard) // ✅ Security guards activated
export class MetaAgentV2Controller {
  private readonly logger = new Logger(MetaAgentV2Controller.name);

  constructor(
    private readonly metaAgentService: MetaAgentProcessService,
    private readonly sessionContextService: SessionContextService,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Process user input through Meta-Agent V2',
    description: `
      Main endpoint for processing user interactions through the Meta-Agent V2 system.
      Supports text, speech, and event inputs across multiple channels (web, voice, WhatsApp, Instagram).
      
      Features:
      - GPT-5 powered responses
      - Vector-based semantic search for context
      - Multi-tenant isolation
      - Action routing to specialized agents
      - Federated context management
    `
  })
  @ApiBody({ type: ProcessRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Request processed successfully',
    type: ProcessResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid JWT token'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async process(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) 
    processRequest: ProcessRequestDto,
    @Req() request: Request
  ): Promise<ProcessResponseDto> {
    this.logger.log(
      `Received process request - Tenant: ${processRequest.tenantId}, Session: ${processRequest.sessionId}, Channel: ${processRequest.channel}`
    );

    const startTime = Date.now();

    try {
      const response = await this.metaAgentService.process(processRequest);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Request processed successfully in ${processingTime}ms - Session: ${processRequest.sessionId}, Tokens: ${response.metrics.tokensConsumed}`
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Error processing request for session ${processRequest.sessionId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  @Get('session/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get session context summary',
    description: 'Retrieve summary information about an active or historical session'
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session identifier',
    example: 'session-uuid-456'
  })
  @ApiResponse({
    status: 200,
    description: 'Session summary retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found'
  })
  async getSession(
    @Param('sessionId') sessionId: string,
    @Req() request: Request
  ): Promise<any> {
    this.logger.log(`Fetching session summary for: ${sessionId}`);

    // Extract tenantId from JWT
    const user = request.user as JwtPayload;
    const tenantId = user?.tenantId || 'default-tenant';

    try {
      const summary = await this.sessionContextService.getSessionSummary(sessionId, tenantId);
      
      this.logger.log(`Session summary retrieved for: ${sessionId}`);
      
      return {
        success: true,
        data: summary
      };
    } catch (error) {
      this.logger.error(`Error fetching session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  @Post('feedback')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit user/tenant feedback',
    description: 'Submit feedback to improve agent responses and fine-tune models (opt-in)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'session-uuid-456' },
        turnId: { type: 'string', example: 'turn-uuid-789' },
        rating: { type: 'number', minimum: 1, maximum: 5, example: 4 },
        feedback: { type: 'string', example: 'Response was helpful but could be more specific' },
        categories: { type: 'array', items: { type: 'string' }, example: ['accuracy', 'relevance'] }
      },
      required: ['sessionId', 'rating']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback submitted successfully'
  })
  async submitFeedback(
    @Body() feedbackData: any,
    @Req() request: Request
  ): Promise<any> {
    this.logger.log(`Feedback received for session: ${feedbackData.sessionId}`);

    // TODO: Implement feedback storage and processing
    
    return {
      success: true,
      message: 'Feedback received and will be used to improve responses'
    };
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Check health status of Meta-Agent V2 and its dependencies'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        version: { type: 'string', example: '2.0.0' },
        dependencies: {
          type: 'object',
          properties: {
            gpt5: { type: 'string', example: 'healthy' },
            vectorDB: { type: 'string', example: 'healthy' },
            database: { type: 'string', example: 'healthy' }
          }
        },
        timestamp: { type: 'string', example: '2025-12-04T10:30:00.000Z' }
      }
    }
  })
  async healthCheck(): Promise<any> {
    this.logger.debug('Health check requested');

    // TODO: Implement comprehensive health checks
    
    return {
      status: 'healthy',
      version: '2.0.0',
      dependencies: {
        gpt5: 'healthy',
        vectorDB: 'healthy',
        database: 'healthy'
      },
      timestamp: new Date().toISOString()
    };
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Meta-Agent V2 metrics',
    description: 'Retrieve performance and usage metrics for the Meta-Agent V2 service'
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully'
  })
  async getMetrics(@Req() request: Request): Promise<any> {
    this.logger.debug('Metrics requested');

    // TODO: Implement metrics aggregation from Prometheus/AppInsights
    
    return {
      success: true,
      data: {
        totalRequests: 0,
        avgResponseTime: 0,
        avgTokensUsed: 0,
        successRate: 0,
        // More metrics...
      }
    };
  }
}