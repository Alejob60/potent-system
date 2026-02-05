import { Controller, Get, Post } from '@nestjs/common';
import { AgentFunctionalityTestService, AgentStatus } from './agent-functionality-test.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('agent-testing')
@Controller('agent-testing')
export class AgentTestController {
  constructor(
    private readonly testService: AgentFunctionalityTestService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get agent functionality status',
    description: 'Retrieve the current status of all agents and their components',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent status report',
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
              endpoints: { type: 'array', items: { type: 'string' } },
              status: { type: 'string', enum: ['complete', 'incomplete', 'partial'] },
              missingComponents: { type: 'array', items: { type: 'string' } },
              notes: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  async getAgentStatus(): Promise<{ timestamp: string; agents: AgentStatus[] }> {
    const statuses = await this.testService.testAllAgents();
    return {
      timestamp: new Date().toISOString(),
      agents: statuses,
    };
  }

  @Get('report')
  @ApiOperation({
    summary: 'Get detailed agent report',
    description: 'Retrieve a detailed report of all agents in markdown format',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed agent report',
  })
  async getAgentReport(): Promise<string> {
    const statuses = await this.testService.testAllAgents();
    return this.testService.generateReport(statuses);
  }

  @Post('test')
  @ApiOperation({
    summary: 'Run agent functionality tests',
    description: 'Execute comprehensive tests on all agents and return results',
  })
  @ApiResponse({
    status: 200,
    description: 'Test results',
  })
  async runAgentTests(): Promise<{ 
    timestamp: string; 
    results: AgentStatus[];
    summary: {
      total: number;
      complete: number;
      incomplete: number;
      partial: number;
    };
  }> {
    const statuses = await this.testService.testAllAgents();
    return {
      timestamp: new Date().toISOString(),
      results: statuses,
      summary: {
        total: statuses.length,
        complete: statuses.filter(s => s.status === 'complete').length,
        incomplete: statuses.filter(s => s.status === 'incomplete').length,
        partial: statuses.filter(s => s.status === 'partial').length,
      },
    };
  }
}