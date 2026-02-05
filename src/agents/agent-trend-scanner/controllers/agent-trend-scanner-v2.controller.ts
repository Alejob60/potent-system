import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentTrendScannerV2Service } from '../services/agent-trend-scanner-v2.service';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Agent - Trend Scanner V2')
@Controller('api/v2/agent/trend-scanner')
export class AgentTrendScannerV2Controller {
  constructor(private readonly service: AgentTrendScannerV2Service) {}

  @Post()
  @ApiOperation({
    summary: 'Analyze social media trends (V2)',
    description:
      'Analyze current trends on social media platforms for specific topics or keywords with enhanced capabilities',
  })
  @ApiBody({
    description: 'Trend analysis parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        platform: {
          type: 'string',
          example: 'tiktok',
          description:
            'Target social media platform (tiktok, instagram, twitter, etc.)',
        },
        topic: {
          type: 'string',
          example: 'sustainable fashion',
          description: 'Topic or keyword to analyze trends for',
        },
        dateRange: {
          type: 'string',
          example: 'last_7_days',
          description:
            'Time period for analysis (last_7_days, last_30_days, custom)',
        },
        detailLevel: {
          type: 'string',
          example: 'comprehensive',
          description: 'Level of detail (basic, standard, comprehensive)',
        },
        region: {
          type: 'string',
          example: 'global',
          description: 'Geographic region for trend analysis',
        },
      },
      required: ['sessionId', 'platform', 'topic'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Trend analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            analysis: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sessionId: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
            trends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  keyword: { type: 'string' },
                  volume: { type: 'number' },
                  growth: { type: 'number' },
                  relatedTerms: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            insights: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
        },
        metrics: {
          type: 'object',
          properties: {
            requestsProcessed: { type: 'number' },
            successRate: { type: 'number' },
            avgResponseTime: { type: 'number' },
            errors: { type: 'number' },
            lastActive: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  async create(@Body() dto: CreateAgentTrendScannerDto) {
    return this.service.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all trend analyses (V2)',
    description:
      'Retrieve a list of all trend analyses performed by this agent',
  })
  @ApiResponse({
    status: 200,
    description: 'List of trend analyses',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          status: { type: 'string' },
          result: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get trend analysis by ID (V2)',
    description: 'Retrieve details of a specific trend analysis by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Trend analysis ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trend analysis details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        sessionId: { type: 'string' },
        status: { type: 'string' },
        result: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Trend analysis not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get agent metrics (V2)',
    description: 'Retrieve performance metrics for this agent',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent metrics',
    schema: {
      type: 'object',
      properties: {
        totalAnalyses: { type: 'number' },
        dbSuccessRate: { type: 'number' },
        dbFailureRate: { type: 'number' },
        requestsProcessed: { type: 'number' },
        avgResponseTime: { type: 'number' },
        errors: { type: 'number' },
        lastActive: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getMetrics() {
    return this.service.getMetrics();
  }
}