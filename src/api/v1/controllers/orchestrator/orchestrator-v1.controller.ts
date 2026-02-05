import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WorkflowEngineService, WorkflowDefinition, WorkflowExecutionResult } from '../../../../common/workflow/workflow-engine.service';
import { PipelineStep, PipelineContext } from '../../../../common/workflow/pipeline-step.interface';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('orchestrator')
@Controller('orchestrator')
export class OrchestratorV1Controller {
  constructor(private readonly workflowEngine: WorkflowEngineService) {}

  @Post('workflow')
  @ApiOperation({
    summary: 'Execute a workflow',
    description: 'Execute a defined workflow with the provided context',
  })
  @ApiBody({
    description: 'Workflow execution parameters',
    schema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            steps: { type: 'array', items: { type: 'object' } },
          },
          required: ['name', 'steps'],
        },
        context: {
          type: 'object',
          properties: {
            sessionId: { type: 'string' },
            sharedData: { type: 'object' },
            stepResults: { type: 'object' },
          },
          required: ['sessionId'],
        },
      },
      required: ['workflow', 'context'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow executed successfully',
    schema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string' },
        status: { type: 'string', enum: ['success', 'failure', 'partial'] },
        stepResults: { type: 'object' },
        duration: { type: 'number' },
        startTime: { type: 'string', format: 'date-time' },
        endTime: { type: 'string', format: 'date-time' },
        error: { type: 'string' },
      },
    },
  })
  async executeWorkflow(
    @Body() body: { workflow: WorkflowDefinition; context: PipelineContext },
  ): Promise<WorkflowExecutionResult> {
    return this.workflowEngine.executeWorkflow(body.workflow, body.context);
  }

  @Post('workflow/create')
  @ApiOperation({
    summary: 'Create a new workflow definition',
    description: 'Create a new workflow definition from steps',
  })
  @ApiBody({
    description: 'Workflow creation parameters',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              agent: { type: 'string' },
              input: { type: 'object' },
              dependencies: { type: 'array', items: { type: 'string' } },
              parallel: { type: 'boolean' },
              priority: { type: 'number' },
            },
            required: ['id', 'name', 'agent'],
          },
        },
      },
      required: ['name', 'steps'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Workflow created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        steps: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
      },
    },
  })
  async createWorkflow(
    @Body() body: { name: string; description: string; steps: PipelineStep[] },
  ) {
    return this.workflowEngine.createWorkflow(
      body.name,
      body.description,
      body.steps,
    );
  }

  @Post('agents/:agentName/execute')
  @ApiOperation({
    summary: 'Execute a single agent',
    description: 'Execute a single agent with the provided parameters',
  })
  @ApiParam({
    name: 'agentName',
    description: 'Name of the agent to execute',
    example: 'trend-scanner',
  })
  @ApiBody({
    description: 'Agent execution parameters',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        params: { type: 'object' },
      },
      required: ['sessionId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Agent executed successfully',
  })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async executeAgent(
    @Param('agentName') agentName: string,
    @Body() body: { sessionId: string; params: Record<string, any> },
  ) {
    // This would delegate to the appropriate agent service
    return {
      message: `Agent ${agentName} execution initiated`,
      sessionId: body.sessionId,
      params: body.params,
    };
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get orchestrator metrics',
    description: 'Retrieve metrics about orchestrator performance and agent execution',
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
      },
    },
  })
  async getMetrics() {
    // Return mock metrics for now
    return {
      workflowsExecuted: 125,
      successfulWorkflows: 118,
      failedWorkflows: 7,
      averageExecutionTime: 2450,
      agentMetrics: {
        'trend-scanner': {
          executions: 45,
          successRate: 95.6,
          averageResponseTime: 1200,
        },
        'video-scriptor': {
          executions: 38,
          successRate: 92.1,
          averageResponseTime: 3200,
        },
      },
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check orchestrator health',
    description: 'Check the health status of the orchestrator and connected agents',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check completed successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        agents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              status: { type: 'string' },
              lastCheck: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getHealth() {
    // Return mock health status for now
    return {
      status: 'healthy',
      agents: [
        { name: 'trend-scanner', status: 'online', lastCheck: new Date().toISOString() },
        { name: 'video-scriptor', status: 'online', lastCheck: new Date().toISOString() },
        { name: 'faq-responder', status: 'online', lastCheck: new Date().toISOString() },
      ],
    };
  }
}