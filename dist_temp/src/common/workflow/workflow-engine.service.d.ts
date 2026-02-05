import { PipelineStep, PipelineContext, StepResult } from './pipeline-step.interface';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';
import { AgentConnectorService } from '../orchestrator/agent-connector.service';
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
export declare class WorkflowEngineService {
    private readonly agentConnector;
    private readonly websocketGateway;
    private readonly stateManager;
    private readonly logger;
    constructor(agentConnector: AgentConnectorService, websocketGateway: WebSocketGatewayService, stateManager: StateManagementService);
    executeWorkflow(workflow: WorkflowDefinition, context: PipelineContext): Promise<WorkflowExecutionResult>;
    private executeStep;
    createWorkflow(name: string, description: string, steps: PipelineStep[]): WorkflowDefinition;
    validateWorkflow(workflow: WorkflowDefinition): boolean;
}
