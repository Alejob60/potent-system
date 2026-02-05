import { Repository } from 'typeorm';
import { WorkflowDefinitionEntity, WorkflowStepDefinition } from './workflow-definition.entity';
import { WorkflowExecutionEntity } from './workflow-execution.entity';
import { WorkflowEngineService } from '../../common/workflow/workflow-engine.service';
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
import { StepResult } from '../../common/workflow/pipeline-step.interface';
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
export declare class MetaOrchestratorService {
    private readonly workflowRepository;
    private readonly executionRepository;
    private readonly workflowEngine;
    private readonly agentConnector;
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly tenantContextStore;
    private readonly globalContextStore;
    private readonly resourceAllocationService;
    private readonly loadBalancerService;
    private readonly faultToleranceService;
    private readonly communicationProtocolService;
    private readonly performanceOptimizationService;
    private readonly errorHandlingService;
    private readonly logger;
    constructor(workflowRepository: Repository<WorkflowDefinitionEntity>, executionRepository: Repository<WorkflowExecutionEntity>, workflowEngine: WorkflowEngineService, agentConnector: AgentConnectorService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, tenantContextStore: TenantContextStore, globalContextStore: GlobalContextStore, resourceAllocationService: ResourceAllocationService, loadBalancerService: LoadBalancerService, faultToleranceService: FaultToleranceService, communicationProtocolService: CommunicationProtocolService, performanceOptimizationService: PerformanceOptimizationService, errorHandlingService: ErrorHandlingService);
    createWorkflow(name: string, description: string, steps: WorkflowStepDefinition[], tenantId: string, createdBy: string, metadata?: Record<string, any>): Promise<WorkflowDefinitionEntity>;
    activateWorkflow(workflowId: string, tenantId: string): Promise<WorkflowDefinitionEntity>;
    executeWorkflow(workflowId: string, context: WorkflowExecutionContext): Promise<WorkflowExecutionResult>;
    getWorkflow(workflowId: string, tenantId: string): Promise<WorkflowDefinitionEntity | null>;
    listWorkflows(tenantId: string, status?: string, limit?: number, offset?: number): Promise<[WorkflowDefinitionEntity[], number]>;
    getExecution(executionId: string, tenantId: string): Promise<WorkflowExecutionEntity | null>;
    listExecutions(tenantId: string, workflowId?: string, status?: string, limit?: number, offset?: number): Promise<[WorkflowExecutionEntity[], number]>;
    cancelExecution(executionId: string, tenantId: string): Promise<boolean>;
}
