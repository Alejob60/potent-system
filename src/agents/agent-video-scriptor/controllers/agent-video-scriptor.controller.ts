import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AgentVideoScriptorService } from '../services/agent-video-scriptor.service';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('video-scriptor')
@Controller('agents/video-scriptor')
export class AgentVideoScriptorController {
  constructor(private readonly service: AgentVideoScriptorService) {}

  @Post()
  @ApiOperation({
    summary: 'Genera gui n emocional',
    description:
      'Genera un gui n adaptado por plataforma, emoci n y objetivo de campa a',
  })
  @ApiBody({
    description: 'Par metros para la generaci n del gui n',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        emotion: {
          type: 'string',
          example: 'excited',
          description:
            'Emoci n detectada (ej. "excited", "curious", "focused")',
        },
        platform: {
          type: 'string',
          example: 'tiktok',
          description: 'Plataforma destino (ej. "tiktok", "shorts", "reels")',
        },
        format: {
          type: 'string',
          example: 'unboxing',
          description: 'Formato viral sugerido (ej. "unboxing", "reaction")',
        },
        objective: {
          type: 'string',
          example: 'product_launch',
          description:
            'Objetivo de campa a (ej. "product_launch", "event", "promotion")',
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
          required: ['name', 'features'],
        },
      },
      required: [
        'sessionId',
        'emotion',
        'platform',
        'format',
        'objective',
        'product',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Gui n generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-123' },
        sessionId: { type: 'string', example: 'user-session-123' },
        emotion: { type: 'string', example: 'excited' },
        platform: { type: 'string', example: 'tiktok' },
        format: { type: 'string', example: 'unboxing' },
        objective: { type: 'string', example: 'product_launch' },
        product: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
          },
        },
        script: { type: 'string', example: 'Gui n generado...' },
        narrative: { type: 'string', example: 'Narrativa emocional...' },
        suggestions: {
          type: 'object',
          properties: {
            style: { type: 'string' },
            pace: { type: 'string' },
            effects: { type: 'string' },
            music: { type: 'string' },
          },
        },
        status: { type: 'string', example: 'completed' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Par metros inv lidos' })
  async create(@Body() dto: CreateAgentVideoScriptorDto) {
    return this.service.create(dto);
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Devuelve guiones por sesi n',
    description:
      'Obtiene todos los guiones generados para una sesi n espec fica',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID de la sesi n del usuario',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de guiones por sesi n',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          emotion: { type: 'string' },
          platform: { type: 'string' },
          format: { type: 'string' },
          objective: { type: 'string' },
          product: { type: 'string' },
          script: { type: 'string' },
          narrative: { type: 'string' },
          suggestions: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Sesi n no encontrada' })
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return this.service.findBySessionId(sessionId);
  }

  @Get('status')
  @ApiOperation({
    summary: 'M tricas del agente',
    description: 'Obtiene m tricas de rendimiento del Video Scriptor Agent',
  })
  @ApiResponse({
    status: 200,
    description: 'M tricas del agente',
    schema: {
      type: 'object',
      properties: {
        totalScripts: { type: 'number', example: 42 },
        successRate: { type: 'number', example: 95.2 },
        failureRate: { type: 'number', example: 4.8 },
        averageGenerationTime: { type: 'number', example: 5.2 },
      },
    },
  })
  async getMetrics() {
    return this.service.getMetrics();
  }

  @Get()
  @ApiOperation({
    summary: 'Get all video creations',
    description: 'Retrieve a list of all video content created by this agent',
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
          emotion: { type: 'string' },
          platform: { type: 'string' },
          format: { type: 'string' },
          objective: { type: 'string' },
          product: { type: 'string' },
          script: { type: 'string' },
          narrative: { type: 'string' },
          suggestions: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get video creation by ID',
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
        emotion: { type: 'string' },
        platform: { type: 'string' },
        format: { type: 'string' },
        objective: { type: 'string' },
        product: { type: 'string' },
        script: { type: 'string' },
        narrative: { type: 'string' },
        suggestions: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Video creation not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
