import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentSpecializedIntegrationService } from '../services/agent-specialized-integration.service';

@ApiTags('Agent - Specialized Integration')
@Controller('agent/specialized-integration')
export class AgentSpecializedIntegrationController {
  constructor(
    private readonly agentService: AgentSpecializedIntegrationService,
  ) {}

  @Post('coordinate')
  @ApiOperation({ summary: 'Coordinate specialized agents' })
  @ApiResponse({ status: 201, description: 'Agents coordinated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async coordinateAgents(
    @Body() payload: any,
  ) {
    return this.agentService.execute(payload);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get combined agent metrics' })
  @ApiResponse({ status: 200, description: 'Combined metrics retrieved successfully.' })
  async getMetrics() {
    return this.agentService.getCombinedMetrics();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get agent statuses' })
  @ApiResponse({ status: 200, description: 'Agent statuses retrieved successfully.' })
  async getStatus() {
    return this.agentService.getAgentStatuses();
  }
}