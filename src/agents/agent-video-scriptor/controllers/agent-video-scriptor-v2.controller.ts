import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentVideoScriptorV2Service } from '../services/agent-video-scriptor-v2.service';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('agents')
@Controller('v2/agents/video-scriptor')
export class AgentVideoScriptorV2Controller {
  constructor(private readonly service: AgentVideoScriptorV2Service) {}

  @Post()
  @ApiOperation({
    summary: 'Generate emotional video script (V2)',
    description:
      'Generate platform-adapted scripts based on emotion and campaign objectives with enhanced capabilities',
  })
  @ApiBody({
    description: 'Script generation parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        emotion: {
          type: 'string',
          example: 'excited',
          description: 'Emotional tone for the script',
        },
        platform: {
          type: 'string',
          example: 'tiktok',
          description: 'Target platform for the script',
        },
        format: {
          type: 'string',
          example: 'unboxing',
          description: 'Content format',
        },
        objective: {
          type: 'string',
          example: 'product_launch',
          description: 'Campaign objective',
        },
        product: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Kimisoft Pulse' },
            features: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'automatizaci n emocional',
                'trazabilidad de m tricas',
                'interfaz intuitiva',
              ],
            },
          },
        },
      },
      required: ['sessionId', 'emotion', 'platform', 'format', 'product'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Script generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            creation: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                sessionId: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
            script: { type: 'string' },
            narrative: { type: 'string' },
            suggestions: { type: 'object' },
            visualStyle: { type: 'object' },
            compressedScript: { type: 'string' },
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
  async create(@Body() dto: CreateAgentVideoScriptorDto) {
    return this.service.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all video creations (V2)',
    description:
      'Retrieve a list of all video creations performed by this agent',
  })
  @ApiResponse({
    status: 200,
    description: 'List of video creations',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          status: { type: 'string' },
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
    summary: 'Get video creation by ID (V2)',
    description: 'Retrieve details of a specific video creation by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Video creation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Video creation details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        sessionId: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Video creation not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get scripts by session (V2)',
    description: 'Retrieve all scripts created during a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Scripts for session',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findBySession(@Param('sessionId') sessionId: string) {
    return this.service.findBySessionId(sessionId);
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
        totalScripts: { type: 'number' },
        dbSuccessRate: { type: 'number' },
        dbFailureRate: { type: 'number' },
        averageGenerationTime: { type: 'number' },
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