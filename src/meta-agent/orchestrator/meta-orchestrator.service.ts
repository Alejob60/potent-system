import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowDefinitionEntity, WorkflowStepDefinition } from './workflow-definition.entity';
import { WorkflowExecutionEntity, StepExecutionResult } from './workflow-execution.entity';
import { WorkflowEngineService, WorkflowExecutionResult as EngineWorkflowExecutionResult } from '../../common/workflow/workflow-engine.service';
import { AgentConnectorService } from '../../common/orchestrator/agent-connector.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { TenantContextStore } from '../security/tenant-context.store';
import { GlobalContextStore } from './global-context.store';
import { ResourceAllocationService } from './resource-allocation.service';
import { LoadBalancerService } from './load-balancer.service';
import { FaultToleranceService } from './fault-tolerance.service';
import { CommunicationProtocolService } from './communication-protocol.service';
import { PerformanceOptimizationService } from './performance-optimization.service';
import { ErrorHandlingService } from './error-handling.service';
import { PipelineStep, StepResult } from '../../common/workflow/pipeline-step.interface';

export interface WorkflowExecutionContext {
  sessionId: string;
  tenantId: string;
  userId?: string;
  inputData: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface WorkflowExecutionResult {
  executionId: string;
  workflowId: string;
  status: 'success' | 'failure' | 'partial';
  stepResults: Record<string, StepResult>;
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: string;
}

@Injectable()
export class MetaOrchestratorService {
  private readonly logger = new Logger(MetaOrchestratorService.name);

  constructor(
    @InjectRepository(WorkflowDefinitionEntity)
    private readonly workflowRepository: Repository<WorkflowDefinitionEntity>,
    @InjectRepository(WorkflowExecutionEntity)
    private readonly executionRepository: Repository<WorkflowExecutionEntity>,
    private readonly workflowEngine: WorkflowEngineService,
    private readonly agentConnector: AgentConnectorService,
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly tenantContextStore: TenantContextStore,
    private readonly globalContextStore: GlobalContextStore,
    private readonly resourceAllocationService: ResourceAllocationService,
    private readonly loadBalancerService: LoadBalancerService,
    private readonly faultToleranceService: FaultToleranceService,
    private readonly communicationProtocolService: CommunicationProtocolService,
    private readonly performanceOptimizationService: PerformanceOptimizationService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  /**
   * Create a new workflow definition
   * @param name Workflow name
   * @param description Workflow description
   * @param steps Workflow steps
   * @param tenantId Tenant ID
   * @param createdBy User who created the workflow
   * @returns Promise resolving to created workflow
   */
  async createWorkflow(
    name: string,
    description: string,
    steps: WorkflowStepDefinition[],
    tenantId: string,
    createdBy: string,
    metadata?: Record<string, any>
  ): Promise<WorkflowDefinitionEntity> {
    this.logger.log(`Creating workflow: ${name} for tenant: ${tenantId}`);

    const workflow = this.workflowRepository.create({
      name,
      description,
      steps,
      status: 'draft',
      version: '1.0.0',
      tenantId,
      createdBy,
      metadata: metadata || {}
    });

    const savedWorkflow = await this.workflowRepository.save(workflow);
    this.logger.log(`Workflow ${name} created with ID: ${savedWorkflow.id}`);
    
    return savedWorkflow;
  }

  /**
   * Activate a workflow
   * @param workflowId Workflow ID
   * @param tenantId Tenant ID
   * @returns Promise resolving to updated workflow
   */
  async activateWorkflow(
    workflowId: string,
    tenantId: string
  ): Promise<WorkflowDefinitionEntity> {
    this.logger.log(`Activating workflow: ${workflowId} for tenant: ${tenantId}`);

    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId, tenantId }
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found for tenant ${tenantId}`);
    }

    workflow.status = 'active';
    workflow.activatedAt = new Date();
    workflow.updatedAt = new Date();

    const updatedWorkflow = await this.workflowRepository.save(workflow);
    this.logger.log(`Workflow ${workflowId} activated`);
    
    return updatedWorkflow;
  }

  /**
   * Execute a workflow
   * @param workflowId Workflow ID
   * @param context Execution context
   * @returns Promise resolving to execution result
   */
  async executeWorkflow(
    workflowId: string,
    context: WorkflowExecutionContext
  ): Promise<WorkflowExecutionResult> {
    this.logger.log(`Executing workflow: ${workflowId} for session: ${context.sessionId}`);

    try {
      // Create global context for this execution
      await this.globalContextStore.createContext(
        context.sessionId,
        context.tenantId,
        context.userId
      );

      // Get workflow definition
      const workflow = await this.workflowRepository.findOne({
        where: { id: workflowId, tenantId: context.tenantId, status: 'active' }
      });

      if (!workflow) {
        throw new Error(`Active workflow ${workflowId} not found for tenant ${context.tenantId}`);
      }

      // Create execution record
      const execution = this.executionRepository.create({
        workflowId: workflow.id,
        workflow: workflow,
        status: 'pending',
        tenantId: context.tenantId,
        sessionId: context.sessionId,
        inputData: context.inputData,
        stepResults: [],
        totalSteps: workflow.steps.length,
        completedSteps: 0,
        durationMs: 0,
        metadata: {
          ...context.metadata,
          userId: context.userId
        }
      });

      const savedExecution = await this.executionRepository.save(execution);
      this.logger.log(`Execution record created with ID: ${savedExecution.id}`);

      // Update global context with workflow execution info
      await this.globalContextStore.setWorkflowExecution(
        context.sessionId,
        workflow.id,
        savedExecution.id
      );

      try {
        // Update execution status to running
        savedExecution.status = 'running';
        savedExecution.startedAt = new Date();
        await this.executionRepository.save(savedExecution);

        // Notify via WebSocket that execution has started
        this.websocketGateway.broadcastSystemNotification({
          type: 'workflow_execution_started',
          executionId: savedExecution.id,
          workflowId: workflow.id,
          workflowName: workflow.name,
          sessionId: context.sessionId,
          tenantId: context.tenantId,
          timestamp: savedExecution.startedAt.toISOString(),
        });

        // Convert WorkflowStepDefinition to PipelineStep
        const pipelineSteps: PipelineStep[] = workflow.steps.map(step => ({
          id: step.id,
          name: step.name,
          description: step.description,
          agent: step.agent,
          input: step.input,
          outputSchema: step.outputSchema,
          timeout: step.timeout,
          retryConfig: step.retryConfig,
          dependencies: step.dependencies,
          parallel: step.parallel,
          priority: step.priority,
          // Add execute method (this is a placeholder since the actual execution is handled by the engine)
          async execute(context) {
            // This is a placeholder - actual execution is handled by the workflow engine
            return Promise.resolve({
              success: true,
              data: {},
              metrics: {
                duration: 0,
                startTime: new Date(),
                endTime: new Date()
              }
            });
          }
        }));

        // Prepare workflow definition for engine
        const workflowDefinition = this.workflowEngine.createWorkflow(
          workflow.name,
          workflow.description,
          pipelineSteps
        );

        // Validate workflow
        if (!this.workflowEngine.validateWorkflow(workflowDefinition)) {
          throw new Error('Workflow validation failed');
        }

        // Prepare pipeline context
        const pipelineContext = {
          sessionId: context.sessionId,
          sharedData: context.inputData,
          stepResults: {}
        };

        // Execute workflow with performance monitoring
        const startTime = Date.now();
        const result: EngineWorkflowExecutionResult = await this.faultToleranceService.executeWithRetry(
          `workflow_${workflowId}`,
          () => this.workflowEngine.executeWorkflow(workflowDefinition, pipelineContext)
        );
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Record performance metrics
        await this.performanceOptimizationService.recordMetrics(context.sessionId, {
          executionTime: duration,
          memoryUsage: 0, // Would be measured in real implementation
          cpuUsage: 0, // Would be measured in real implementation
          throughput: 0, // Would be measured in real implementation
          errorRate: 0, // Would be measured in real implementation
          cacheHitRate: 0, // Would be measured in real implementation
          timestamp: new Date()
        });

        // Update execution record with results
        const completionTime = new Date();
        const executionDurationMs = completionTime.getTime() - savedExecution.startedAt.getTime();

        savedExecution.status = result.status === 'success' ? 'completed' : 'failed';
        savedExecution.completedAt = completionTime;
        savedExecution.durationMs = executionDurationMs;
        savedExecution.stepResults = Object.entries(result.stepResults).map(([stepId, stepResult]) => ({
          stepId,
          stepName: workflow.steps.find(s => s.id === stepId)?.name || stepId,
          success: stepResult.success,
          data: stepResult.data,
          error: stepResult.error,
          metrics: stepResult.metrics,
          agentResult: stepResult.agentResult
        }));
        savedExecution.completedSteps = savedExecution.stepResults.filter(r => r.success).length;
        savedExecution.error = result.error || '';

        await this.executionRepository.save(savedExecution);

        // Notify via WebSocket that execution has completed
        this.websocketGateway.broadcastSystemNotification({
          type: 'workflow_execution_completed',
          executionId: savedExecution.id,
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: savedExecution.status,
          sessionId: context.sessionId,
          tenantId: context.tenantId,
          duration: executionDurationMs,
          timestamp: completionTime.toISOString(),
        });

        // Clean up global context
        await this.globalContextStore.deleteContext(context.sessionId);

        // Return result
        return {
          executionId: savedExecution.id,
          workflowId: workflow.id,
          status: result.status,
          stepResults: result.stepResults,
          duration: result.duration,
          startTime: result.startTime,
          endTime: result.endTime,
          error: result.error || undefined
        };
      } catch (error) {
        this.logger.error(`Workflow execution failed: ${error.message}`, error.stack);

        // Record error
        await this.errorHandlingService.recordError({
          type: 'workflow_execution_error',
          message: error.message,
          stack: error.stack,
          context: {
            workflowId,
            sessionId: context.sessionId,
            tenantId: context.tenantId
          },
          severity: 'high',
          component: 'MetaOrchestratorService',
          sessionId: context.sessionId,
          workflowId: workflowId,
          executionId: savedExecution.id
        });

        // Update execution record with error
        const endTime = new Date();
        const durationMs = endTime.getTime() - (savedExecution.startedAt?.getTime() || endTime.getTime());

        savedExecution.status = 'failed';
        savedExecution.completedAt = endTime;
        savedExecution.durationMs = durationMs;
        savedExecution.error = error.message;

        await this.executionRepository.save(savedExecution);

        // Notify via WebSocket that execution has failed
        this.websocketGateway.broadcastSystemNotification({
          type: 'workflow_execution_failed',
          executionId: savedExecution.id,
          workflowId: workflow.id,
          workflowName: workflow.name,
          error: error.message,
          sessionId: context.sessionId,
          tenantId: context.tenantId,
          timestamp: endTime.toISOString(),
        });

        // Clean up global context
        await this.globalContextStore.deleteContext(context.sessionId);

        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to execute workflow ${workflowId}: ${error.message}`, error.stack);
      
      // Record error
      await this.errorHandlingService.recordError({
        type: 'workflow_execution_setup_error',
        message: error.message,
        stack: error.stack,
        context: {
          workflowId,
          sessionId: context.sessionId,
          tenantId: context.tenantId
        },
        severity: 'critical',
        component: 'MetaOrchestratorService',
        sessionId: context.sessionId,
        workflowId: workflowId
      });

      throw error;
    }
  }

  /**
   * Get workflow by ID
   * @param workflowId Workflow ID
   * @param tenantId Tenant ID
   * @returns Promise resolving to workflow
   */
  async getWorkflow(
    workflowId: string,
    tenantId: string
  ): Promise<WorkflowDefinitionEntity | null> {
    return this.workflowRepository.findOne({
      where: { id: workflowId, tenantId }
    });
  }

  /**
   * List workflows for a tenant
   * @param tenantId Tenant ID
   * @param status Optional status filter
   * @param limit Optional limit
   * @param offset Optional offset
   * @returns Promise resolving to workflows
   */
  async listWorkflows(
    tenantId: string,
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<[WorkflowDefinitionEntity[], number]> {
    const query = this.workflowRepository.createQueryBuilder('workflow')
      .where('workflow.tenantId = :tenantId', { tenantId })
      .skip(offset)
      .take(limit)
      .orderBy('workflow.createdAt', 'DESC');

    if (status) {
      query.andWhere('workflow.status = :status', { status });
    }

    return query.getManyAndCount();
  }

  /**
   * Get execution by ID
   * @param executionId Execution ID
   * @param tenantId Tenant ID
   * @returns Promise resolving to execution
   */
  async getExecution(
    executionId: string,
    tenantId: string
  ): Promise<WorkflowExecutionEntity | null> {
    return this.executionRepository.findOne({
      where: { id: executionId, tenantId },
      relations: ['workflow']
    });
  }

  /**
   * List executions for a tenant
   * @param tenantId Tenant ID
   * @param workflowId Optional workflow ID filter
   * @param status Optional status filter
   * @param limit Optional limit
   * @param offset Optional offset
   * @returns Promise resolving to executions
   */
  async listExecutions(
    tenantId: string,
    workflowId?: string,
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<[WorkflowExecutionEntity[], number]> {
    const query = this.executionRepository.createQueryBuilder('execution')
      .leftJoinAndSelect('execution.workflow', 'workflow')
      .where('execution.tenantId = :tenantId', { tenantId })
      .skip(offset)
      .take(limit)
      .orderBy('execution.createdAt', 'DESC');

    if (workflowId) {
      query.andWhere('execution.workflowId = :workflowId', { workflowId });
    }

    if (status) {
      query.andWhere('execution.status = :status', { status });
    }

    return query.getManyAndCount();
  }

  /**
   * Cancel a workflow execution
   * @param executionId Execution ID
   * @param tenantId Tenant ID
   * @returns Promise resolving to boolean indicating success
   */
  async cancelExecution(
    executionId: string,
    tenantId: string
  ): Promise<boolean> {
    const execution = await this.executionRepository.findOne({
      where: { id: executionId, tenantId }
    });

    if (!execution) {
      return false;
    }

    if (execution.status !== 'running') {
      throw new Error('Only running executions can be cancelled');
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    execution.durationMs = execution.completedAt.getTime() - (execution.startedAt?.getTime() || execution.completedAt.getTime());

    await this.executionRepository.save(execution);

    // Notify via WebSocket that execution has been cancelled
    this.websocketGateway.broadcastSystemNotification({
      type: 'workflow_execution_cancelled',
      executionId: execution.id,
      workflowId: execution.workflowId,
      sessionId: execution.sessionId,
      tenantId: execution.tenantId,
      timestamp: execution.completedAt.toISOString(),
    });

    return true;
  }
}