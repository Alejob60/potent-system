import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MetaOrchestratorService, WorkflowExecutionContext } from './meta-orchestrator.service';
import { WorkflowDefinitionEntity, WorkflowStepDefinition } from './workflow-definition.entity';
import { WorkflowExecutionEntity } from './workflow-execution.entity';

interface TenantContext {
  tenantId: string;
  siteId: string;
  origin: string;
  permissions: string[];
  channel?: string;
  sessionId?: string;
}

@ApiTags('Meta-Agent - Orchestration')
@Controller('v1/meta-agent/orchestrator')
export class MetaOrchestratorController {
  private readonly logger = new Logger(MetaOrchestratorController.name);

  constructor(
    private readonly orchestratorService: MetaOrchestratorService,
  ) {}

  @Post('workflows')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Content Creation Workflow' },
        description: { type: 'string', example: 'Workflow for creating viral content' },
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
              dependencies: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        metadata: { type: 'object' }
      },
      required: ['name', 'steps']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Workflow created successfully',
    type: WorkflowDefinitionEntity
  })
  async createWorkflow(
    @Req() req: Request,
    @Body() body: {
      name: string;
      description: string;
      steps: WorkflowStepDefinition[];
      metadata?: Record<string, any>;
    }
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const workflow = await this.orchestratorService.createWorkflow(
        body.name,
        body.description,
        body.steps,
        tenantContext.tenantId,
        tenantContext.siteId, // Using siteId as createdBy
        body.metadata
      );

      return {
        success: true,
        data: workflow,
        message: 'Workflow created successfully'
      };
    } catch (error) {
      this.logger.error('Error creating workflow', error.stack);
      throw error;
    }
  }

  @Put('workflows/:workflowId/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a workflow' })
  @ApiParam({ name: 'workflowId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Workflow activated successfully',
    type: WorkflowDefinitionEntity
  })
  async activateWorkflow(
    @Req() req: Request,
    @Param('workflowId') workflowId: string
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const workflow = await this.orchestratorService.activateWorkflow(
        workflowId,
        tenantContext.tenantId
      );

      return {
        success: true,
        data: workflow,
        message: 'Workflow activated successfully'
      };
    } catch (error) {
      this.logger.error('Error activating workflow', error.stack);
      throw error;
    }
  }

  @Post('workflows/:workflowId/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a workflow' })
  @ApiParam({ name: 'workflowId', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        inputData: { type: 'object' },
        userId: { type: 'string' },
        metadata: { type: 'object' }
      },
      required: ['sessionId', 'inputData']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow execution started successfully'
  })
  async executeWorkflow(
    @Req() req: Request,
    @Param('workflowId') workflowId: string,
    @Body() body: {
      sessionId: string;
      inputData: Record<string, any>;
      userId?: string;
      metadata?: Record<string, any>;
    }
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const context: WorkflowExecutionContext = {
        sessionId: body.sessionId,
        tenantId: tenantContext.tenantId,
        userId: body.userId,
        inputData: body.inputData,
        metadata: body.metadata
      };

      const result = await this.orchestratorService.executeWorkflow(workflowId, context);

      return {
        success: true,
        data: result,
        message: 'Workflow execution completed successfully'
      };
    } catch (error) {
      this.logger.error('Error executing workflow', error.stack);
      throw error;
    }
  }

  @Get('workflows/:workflowId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiParam({ name: 'workflowId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Workflow retrieved successfully',
    type: WorkflowDefinitionEntity
  })
  async getWorkflow(
    @Req() req: Request,
    @Param('workflowId') workflowId: string
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const workflow = await this.orchestratorService.getWorkflow(
        workflowId,
        tenantContext.tenantId
      );

      if (!workflow) {
        return {
          success: false,
          message: 'Workflow not found'
        };
      }

      return {
        success: true,
        data: workflow,
        message: 'Workflow retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error retrieving workflow', error.stack);
      throw error;
    }
  }

  @Get('workflows')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List workflows' })
  @ApiQuery({ name: 'status', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Workflows retrieved successfully'
  })
  async listWorkflows(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const [workflows, total] = await this.orchestratorService.listWorkflows(
        tenantContext.tenantId,
        status,
        limit,
        offset
      );

      return {
        success: true,
        data: {
          workflows,
          total,
          limit,
          offset
        },
        message: 'Workflows retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error listing workflows', error.stack);
      throw error;
    }
  }

  @Get('executions/:executionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get execution by ID' })
  @ApiParam({ name: 'executionId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Execution retrieved successfully',
    type: WorkflowExecutionEntity
  })
  async getExecution(
    @Req() req: Request,
    @Param('executionId') executionId: string
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const execution = await this.orchestratorService.getExecution(
        executionId,
        tenantContext.tenantId
      );

      if (!execution) {
        return {
          success: false,
          message: 'Execution not found'
        };
      }

      return {
        success: true,
        data: execution,
        message: 'Execution retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error retrieving execution', error.stack);
      throw error;
    }
  }

  @Get('executions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List executions' })
  @ApiQuery({ name: 'workflowId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Executions retrieved successfully'
  })
  async listExecutions(
    @Req() req: Request,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const [executions, total] = await this.orchestratorService.listExecutions(
        tenantContext.tenantId,
        workflowId,
        status,
        limit,
        offset
      );

      return {
        success: true,
        data: {
          executions,
          total,
          limit,
          offset
        },
        message: 'Executions retrieved successfully'
      };
    } catch (error) {
      this.logger.error('Error listing executions', error.stack);
      throw error;
    }
  }

  @Delete('executions/:executionId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a workflow execution' })
  @ApiParam({ name: 'executionId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Execution cancelled successfully'
  })
  async cancelExecution(
    @Req() req: Request,
    @Param('executionId') executionId: string
  ) {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      if (!tenantContext) {
        throw new Error('Tenant context not found');
      }

      const result = await this.orchestratorService.cancelExecution(
        executionId,
        tenantContext.tenantId
      );

      if (!result) {
        return {
          success: false,
          message: 'Execution not found or could not be cancelled'
        };
      }

      return {
        success: true,
        message: 'Execution cancelled successfully'
      };
    } catch (error) {
      this.logger.error('Error cancelling execution', error.stack);
      throw error;
    }
  }
}