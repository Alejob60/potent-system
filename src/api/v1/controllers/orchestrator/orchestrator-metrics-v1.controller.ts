import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { OrchestratorMetricsService } from '../../../../common/orchestrator/orchestrator-metrics.service';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('orchestrator')
@Controller('orchestrator/metrics')
export class OrchestratorMetricsV1Controller {
  constructor(private readonly metricsService: OrchestratorMetricsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get orchestrator metrics',
    description: 'Retrieve current orchestrator metrics including workflow and agent statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Orchestrator metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        workflowsExecuted: { type: 'number' },
        successfulWorkflows: { type: 'number' },
        failedWorkflows: { type: 'number' },
        averageExecutionTime: { type: 'number' },
        agentMetrics: { type: 'object' },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getMetrics() {
    return this.metricsService.getMetrics();
  }

  @Get('agent/:agentName')
  @ApiOperation({
    summary: 'Get metrics for a specific agent',
    description: 'Retrieve metrics for a specific agent including execution statistics',
  })
  @ApiParam({
    name: 'agentName',
    description: 'Name of the agent',
    example: 'trend-scanner',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        executions: { type: 'number' },
        successRate: { type: 'number' },
        averageResponseTime: { type: 'number' },
        errors: { type: 'number' },
        lastExecution: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentMetrics(@Param('agentName') agentName: string) {
    const metrics = await this.metricsService.getAgentMetrics(agentName);
    if (!metrics) {
      return { message: `Agent ${agentName} not found` };
    }
    return metrics;
  }

  @Get('workflow/:workflowId')
  @ApiOperation({
    summary: 'Get execution details for a specific workflow',
    description: 'Retrieve detailed execution information for a specific workflow',
  })
  @ApiParam({
    name: 'workflowId',
    description: 'ID of the workflow',
    example: 'workflow_1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow execution details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string' },
        status: { type: 'string', enum: ['success', 'failure', 'partial'] },
        duration: { type: 'number' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        agentExecutions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              status: { type: 'string', enum: ['success', 'failure'] },
              duration: { type: 'number' },
              startTime: { type: 'string', format: 'date-time' },
              endTime: { type: 'string', format: 'date-time' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  async getWorkflowExecution(@Param('workflowId') workflowId: string) {
    const execution = await this.metricsService.getWorkflowExecution(workflowId);
    if (!execution) {
      return { message: `Workflow ${workflowId} not found` };
    }
    return execution;
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent workflow executions',
    description: 'Retrieve a list of recent workflow executions',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of executions to return (default: 50)',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent workflow executions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          workflowId: { type: 'string' },
          status: { type: 'string', enum: ['success', 'failure', 'partial'] },
          duration: { type: 'number' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getRecentExecutions(
    @Query('limit', ParseIntPipe) limit: number = 50,
  ) {
    return this.metricsService.getRecentExecutions(limit);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get orchestrator dashboard data',
    description: 'Retrieve comprehensive dashboard data for orchestrator monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        metrics: {
          type: 'object',
          properties: {
            workflowsExecuted: { type: 'number' },
            successfulWorkflows: { type: 'number' },
            failedWorkflows: { type: 'number' },
            averageExecutionTime: { type: 'number' },
          },
        },
        topAgents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              executions: { type: 'number' },
              successRate: { type: 'number' },
              averageResponseTime: { type: 'number' },
            },
          },
        },
        recentExecutions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              status: { type: 'string' },
              duration: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getDashboard() {
    const metrics = await this.metricsService.getMetrics();
    
    // Get top 5 agents by execution count
    const topAgents = Object.entries(metrics.agentMetrics)
      .sort(([,a], [,b]) => b.executions - a.executions)
      .slice(0, 5)
      .map(([name, metrics]) => ({
        name,
        ...metrics
      }));

    return {
      metrics: {
        workflowsExecuted: metrics.workflowsExecuted,
        successfulWorkflows: metrics.successfulWorkflows,
        failedWorkflows: metrics.failedWorkflows,
        averageExecutionTime: metrics.averageExecutionTime,
      },
      topAgents,
      recentExecutions: [], // Would be populated in a real implementation
    };
  }
}