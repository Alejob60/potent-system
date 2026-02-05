import { Injectable, Logger } from '@nestjs/common';
import { PipelineStep, PipelineContext, StepResult } from './pipeline-step.interface';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';
import { AgentConnectorService, AgentExecutionResult } from '../orchestrator/agent-connector.service';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  createdAt: Date;
  version: string;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  status: 'success' | 'failure' | 'partial';
  stepResults: Record<string, StepResult>;
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: string;
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private readonly agentConnector: AgentConnectorService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly stateManager: StateManagementService,
  ) {}

  /**
   * Execute a workflow with the given definition
   * @param workflow Workflow definition to execute
   * @param context Initial execution context
   * @returns Promise resolving to workflow execution result
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    context: PipelineContext,
  ): Promise<WorkflowExecutionResult> {
    const startTime = new Date();
    this.logger.log(`Starting workflow execution: ${workflow.name} (${workflow.id})`);

    // Notify via WebSocket that workflow has started
    this.websocketGateway.broadcastSystemNotification({
      type: 'workflow_started',
      workflowId: workflow.id,
      workflowName: workflow.name,
      sessionId: context.sessionId,
      timestamp: startTime.toISOString(),
    });

    const stepResults: Record<string, StepResult> = {};
    let workflowError: string | undefined;

    try {
      // Execute steps in order
      for (const step of workflow.steps) {
        // Check if dependencies are met
        if (step.dependencies && step.dependencies.length > 0) {
          const missingDeps = step.dependencies.filter(
            depId => !stepResults[depId] || !stepResults[depId].success
          );
          
          if (missingDeps.length > 0) {
            const error = `Step ${step.id} has unmet dependencies: ${missingDeps.join(', ')}`;
            this.logger.error(error);
            
            stepResults[step.id] = {
              success: false,
              error: {
                message: error
              }
            };
            
            continue;
          }
        }

        // Execute the step
        const stepResult = await this.executeStep(step, context, stepResults);
        stepResults[step.id] = stepResult;

        // Update context with step results
        context.stepResults = { ...context.stepResults, ...stepResults };

        // Notify via WebSocket about step completion
        this.websocketGateway.broadcastSystemNotification({
          type: 'step_completed',
          workflowId: workflow.id,
          stepId: step.id,
          stepName: step.name,
          success: stepResult.success,
          sessionId: context.sessionId,
          timestamp: new Date().toISOString(),
        });

        // If step failed and it's critical, stop workflow
        if (!stepResult.success) {
          this.logger.error(`Step ${step.id} failed: ${stepResult.error?.message}`);
          
          // For now, we'll continue with other steps, but in a real implementation
          // you might want to stop based on step criticality
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Determine overall workflow status
      const successfulSteps = Object.values(stepResults).filter(result => result.success).length;
      const totalSteps = workflow.steps.length;
      const status = successfulSteps === totalSteps 
        ? 'success' 
        : successfulSteps > 0 
          ? 'partial' 
          : 'failure';

      // Notify via WebSocket that workflow has completed
      this.websocketGateway.broadcastSystemNotification({
        type: 'workflow_completed',
        workflowId: workflow.id,
        workflowName: workflow.name,
        status,
        sessionId: context.sessionId,
        duration,
        timestamp: endTime.toISOString(),
      });

      const result: WorkflowExecutionResult = {
        workflowId: workflow.id,
        status,
        stepResults,
        duration,
        startTime,
        endTime,
        error: workflowError
      };

      // Log workflow completion
      this.logger.log(`Workflow ${workflow.name} completed with status: ${status}`);

      return result;
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      this.logger.error(`Workflow ${workflow.name} failed: ${error.message}`, error.stack);
      
      // Notify via WebSocket that workflow has failed
      this.websocketGateway.broadcastSystemNotification({
        type: 'workflow_failed',
        workflowId: workflow.id,
        workflowName: workflow.name,
        error: error.message,
        sessionId: context.sessionId,
        timestamp: endTime.toISOString(),
      });

      return {
        workflowId: workflow.id,
        status: 'failure',
        stepResults,
        duration,
        startTime,
        endTime,
        error: error.message
      };
    }
  }

  /**
   * Execute a single pipeline step
   * @param step Step to execute
   * @param context Execution context
   * @param previousResults Results from previous steps
   * @returns Promise resolving to step result
   */
  private async executeStep(
    step: PipelineStep,
    context: PipelineContext,
    previousResults: Record<string, StepResult>,
  ): Promise<StepResult> {
    const stepStartTime = new Date();
    this.logger.log(`Executing step: ${step.name} (${step.id}) with agent: ${step.agent}`);

    try {
      // Prepare input data by merging context and previous results
      const inputData = {
        ...context.sharedData,
        ...step.input,
        previousResults,
        sessionId: context.sessionId
      };

      // Execute with retry logic if configured
      const result: AgentExecutionResult = await this.agentConnector.post(
        step.agent,
        inputData,
        '',
        {
          timeout: step.timeout || 30000,
          retries: step.retryConfig?.maxAttempts || 1
        }
      );

      const stepEndTime = new Date();
      const duration = stepEndTime.getTime() - stepStartTime.getTime();

      if (result.success) {
        // Update session state with step execution
        this.stateManager.addConversationEntry(context.sessionId, {
          type: 'system_event',
          content: `Step ${step.name} completed successfully`,
          metadata: {
            stepId: step.id,
            agent: step.agent,
            duration,
            response: result.data
          }
        });

        return {
          success: true,
          data: result.data,
          metrics: {
            duration,
            startTime: stepStartTime,
            endTime: stepEndTime
          },
          agentResult: {
            agent: step.agent,
            result: result.data
          }
        };
      } else {
        // Update session state with step failure
        this.stateManager.addConversationEntry(context.sessionId, {
          type: 'system_event',
          content: `Step ${step.name} failed after ${result.metadata.retries + 1} attempts`,
          metadata: {
            stepId: step.id,
            agent: step.agent,
            duration,
            error: result.error?.message
          }
        });

        return {
          success: false,
          error: {
            message: result.error?.message || 'Unknown error',
            details: result.error
          },
          metrics: {
            duration,
            startTime: stepStartTime,
            endTime: stepEndTime
          }
        };
      }
    } catch (error) {
      const stepEndTime = new Date();
      const duration = stepEndTime.getTime() - stepStartTime.getTime();

      this.logger.error(`Step ${step.id} failed: ${error.message}`, error.stack);

      return {
        success: false,
        error: {
          message: error.message,
          details: error
        },
        metrics: {
          duration,
          startTime: stepStartTime,
          endTime: stepEndTime
        }
      };
    }
  }

  /**
   * Create a workflow definition from steps
   * @param name Workflow name
   * @param description Workflow description
   * @param steps Pipeline steps
   * @returns Workflow definition
   */
  createWorkflow(
    name: string,
    description: string,
    steps: PipelineStep[]
  ): WorkflowDefinition {
    return {
      id: `workflow_${Date.now()}`,
      name,
      description,
      steps,
      createdAt: new Date(),
      version: '1.0.0'
    };
  }

  /**
   * Validate a workflow definition
   * @param workflow Workflow to validate
   * @returns Boolean indicating if workflow is valid
   */
  validateWorkflow(workflow: WorkflowDefinition): boolean {
    // Check for duplicate step IDs
    const stepIds = workflow.steps.map(step => step.id);
    const uniqueStepIds = new Set(stepIds);
    
    if (stepIds.length !== uniqueStepIds.size) {
      this.logger.error('Workflow validation failed: Duplicate step IDs found');
      return false;
    }

    // Check for circular dependencies
    // This is a simplified check - a full implementation would use topological sorting
    for (const step of workflow.steps) {
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          const depStep = workflow.steps.find(s => s.id === depId);
          if (!depStep) {
            this.logger.error(`Workflow validation failed: Dependency ${depId} not found for step ${step.id}`);
            return false;
          }
        }
      }
    }

    return true;
  }
}