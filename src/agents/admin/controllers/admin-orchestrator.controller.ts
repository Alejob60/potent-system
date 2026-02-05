import { Controller, Post, Body } from '@nestjs/common';
import {
  AdminOrchestratorService,
  AgentResult,
} from '../services/admin-orchestrator.service';
import { AgentOrchestrationDto } from '../dto/agent-orchestration.dto';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin/orchestrate')
export class AdminOrchestratorController {
  constructor(private readonly service: AdminOrchestratorService) {}

  @Post()
  @ApiOperation({
    summary: 'Orchestrate AI agents',
    description:
      'Coordinate multiple AI agents to perform complex tasks based on user requests',
  })
  @ApiBody({
    description: 'Agent orchestration parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'user-session-123' },
        task: {
          type: 'string',
          example: 'Create a social media campaign for our new product launch',
        },
        context: {
          type: 'object',
          properties: {
            businessInfo: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'MisyBot' },
                location: { type: 'string', example: 'San Francisco, CA' },
              },
            },
            targetChannels: {
              type: 'array',
              items: { type: 'string' },
              example: ['instagram', 'facebook', 'twitter'],
            },
            currentObjective: {
              type: 'string',
              example: 'Increase brand awareness',
            },
            preferences: {
              type: 'object',
              properties: {
                contentTypes: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['video', 'image', 'text'],
                },
                tone: { type: 'string', example: 'professional' },
                frequency: { type: 'string', example: 'daily' },
              },
            },
          },
        },
        agents: {
          type: 'array',
          items: { type: 'string' },
          example: ['trend-scanner', 'video-scriptor', 'post-scheduler'],
        },
      },
      required: ['sessionId', 'task'],
    },
  })
  @ApiResponse({ status: 200, description: 'Agents orchestrated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async orchestrate(
    @Body() dto: AgentOrchestrationDto,
  ): Promise<PromiseSettledResult<AgentResult>[]> {
    return this.service.orchestrate(dto);
  }
}
