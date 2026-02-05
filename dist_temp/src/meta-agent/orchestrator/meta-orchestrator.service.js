"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MetaOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workflow_definition_entity_1 = require("./workflow-definition.entity");
const workflow_execution_entity_1 = require("./workflow-execution.entity");
const workflow_engine_service_1 = require("../../common/workflow/workflow-engine.service");
const agent_connector_service_1 = require("../../common/orchestrator/agent-connector.service");
const state_management_service_1 = require("../../state/state-management.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const tenant_context_store_1 = require("../security/tenant-context.store");
const global_context_store_1 = require("./global-context.store");
const resource_allocation_service_1 = require("./resource-allocation.service");
const load_balancer_service_1 = require("./load-balancer.service");
const fault_tolerance_service_1 = require("./fault-tolerance.service");
const communication_protocol_service_1 = require("./communication-protocol.service");
const performance_optimization_service_1 = require("./performance-optimization.service");
const error_handling_service_1 = require("./error-handling.service");
let MetaOrchestratorService = MetaOrchestratorService_1 = class MetaOrchestratorService {
    constructor(workflowRepository, executionRepository, workflowEngine, agentConnector, stateManager, websocketGateway, tenantContextStore, globalContextStore, resourceAllocationService, loadBalancerService, faultToleranceService, communicationProtocolService, performanceOptimizationService, errorHandlingService) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
        this.workflowEngine = workflowEngine;
        this.agentConnector = agentConnector;
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.tenantContextStore = tenantContextStore;
        this.globalContextStore = globalContextStore;
        this.resourceAllocationService = resourceAllocationService;
        this.loadBalancerService = loadBalancerService;
        this.faultToleranceService = faultToleranceService;
        this.communicationProtocolService = communicationProtocolService;
        this.performanceOptimizationService = performanceOptimizationService;
        this.errorHandlingService = errorHandlingService;
        this.logger = new common_1.Logger(MetaOrchestratorService_1.name);
    }
    async createWorkflow(name, description, steps, tenantId, createdBy, metadata) {
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
    async activateWorkflow(workflowId, tenantId) {
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
    async executeWorkflow(workflowId, context) {
        this.logger.log(`Executing workflow: ${workflowId} for session: ${context.sessionId}`);
        try {
            await this.globalContextStore.createContext(context.sessionId, context.tenantId, context.userId);
            const workflow = await this.workflowRepository.findOne({
                where: { id: workflowId, tenantId: context.tenantId, status: 'active' }
            });
            if (!workflow) {
                throw new Error(`Active workflow ${workflowId} not found for tenant ${context.tenantId}`);
            }
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
            await this.globalContextStore.setWorkflowExecution(context.sessionId, workflow.id, savedExecution.id);
            try {
                savedExecution.status = 'running';
                savedExecution.startedAt = new Date();
                await this.executionRepository.save(savedExecution);
                this.websocketGateway.broadcastSystemNotification({
                    type: 'workflow_execution_started',
                    executionId: savedExecution.id,
                    workflowId: workflow.id,
                    workflowName: workflow.name,
                    sessionId: context.sessionId,
                    tenantId: context.tenantId,
                    timestamp: savedExecution.startedAt.toISOString(),
                });
                const pipelineSteps = workflow.steps.map(step => ({
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
                    async execute(context) {
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
                const workflowDefinition = this.workflowEngine.createWorkflow(workflow.name, workflow.description, pipelineSteps);
                if (!this.workflowEngine.validateWorkflow(workflowDefinition)) {
                    throw new Error('Workflow validation failed');
                }
                const pipelineContext = {
                    sessionId: context.sessionId,
                    sharedData: context.inputData,
                    stepResults: {}
                };
                const startTime = Date.now();
                const result = await this.faultToleranceService.executeWithRetry(`workflow_${workflowId}`, () => this.workflowEngine.executeWorkflow(workflowDefinition, pipelineContext));
                const endTime = Date.now();
                const duration = endTime - startTime;
                await this.performanceOptimizationService.recordMetrics(context.sessionId, {
                    executionTime: duration,
                    memoryUsage: 0,
                    cpuUsage: 0,
                    throughput: 0,
                    errorRate: 0,
                    cacheHitRate: 0,
                    timestamp: new Date()
                });
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
                await this.globalContextStore.deleteContext(context.sessionId);
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
            }
            catch (error) {
                this.logger.error(`Workflow execution failed: ${error.message}`, error.stack);
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
                const endTime = new Date();
                const durationMs = endTime.getTime() - (savedExecution.startedAt?.getTime() || endTime.getTime());
                savedExecution.status = 'failed';
                savedExecution.completedAt = endTime;
                savedExecution.durationMs = durationMs;
                savedExecution.error = error.message;
                await this.executionRepository.save(savedExecution);
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
                await this.globalContextStore.deleteContext(context.sessionId);
                throw error;
            }
        }
        catch (error) {
            this.logger.error(`Failed to execute workflow ${workflowId}: ${error.message}`, error.stack);
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
    async getWorkflow(workflowId, tenantId) {
        return this.workflowRepository.findOne({
            where: { id: workflowId, tenantId }
        });
    }
    async listWorkflows(tenantId, status, limit = 50, offset = 0) {
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
    async getExecution(executionId, tenantId) {
        return this.executionRepository.findOne({
            where: { id: executionId, tenantId },
            relations: ['workflow']
        });
    }
    async listExecutions(tenantId, workflowId, status, limit = 50, offset = 0) {
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
    async cancelExecution(executionId, tenantId) {
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
};
exports.MetaOrchestratorService = MetaOrchestratorService;
exports.MetaOrchestratorService = MetaOrchestratorService = MetaOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workflow_definition_entity_1.WorkflowDefinitionEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(workflow_execution_entity_1.WorkflowExecutionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        workflow_engine_service_1.WorkflowEngineService,
        agent_connector_service_1.AgentConnectorService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        tenant_context_store_1.TenantContextStore,
        global_context_store_1.GlobalContextStore,
        resource_allocation_service_1.ResourceAllocationService,
        load_balancer_service_1.LoadBalancerService,
        fault_tolerance_service_1.FaultToleranceService,
        communication_protocol_service_1.CommunicationProtocolService,
        performance_optimization_service_1.PerformanceOptimizationService,
        error_handling_service_1.ErrorHandlingService])
], MetaOrchestratorService);
//# sourceMappingURL=meta-orchestrator.service.js.map