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
var WorkflowEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const state_management_service_1 = require("../../state/state-management.service");
const agent_connector_service_1 = require("../orchestrator/agent-connector.service");
let WorkflowEngineService = WorkflowEngineService_1 = class WorkflowEngineService {
    constructor(agentConnector, websocketGateway, stateManager) {
        this.agentConnector = agentConnector;
        this.websocketGateway = websocketGateway;
        this.stateManager = stateManager;
        this.logger = new common_1.Logger(WorkflowEngineService_1.name);
    }
    async executeWorkflow(workflow, context) {
        const startTime = new Date();
        this.logger.log(`Starting workflow execution: ${workflow.name} (${workflow.id})`);
        this.websocketGateway.broadcastSystemNotification({
            type: 'workflow_started',
            workflowId: workflow.id,
            workflowName: workflow.name,
            sessionId: context.sessionId,
            timestamp: startTime.toISOString(),
        });
        const stepResults = {};
        let workflowError;
        try {
            for (const step of workflow.steps) {
                if (step.dependencies && step.dependencies.length > 0) {
                    const missingDeps = step.dependencies.filter(depId => !stepResults[depId] || !stepResults[depId].success);
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
                const stepResult = await this.executeStep(step, context, stepResults);
                stepResults[step.id] = stepResult;
                context.stepResults = { ...context.stepResults, ...stepResults };
                this.websocketGateway.broadcastSystemNotification({
                    type: 'step_completed',
                    workflowId: workflow.id,
                    stepId: step.id,
                    stepName: step.name,
                    success: stepResult.success,
                    sessionId: context.sessionId,
                    timestamp: new Date().toISOString(),
                });
                if (!stepResult.success) {
                    this.logger.error(`Step ${step.id} failed: ${stepResult.error?.message}`);
                }
            }
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            const successfulSteps = Object.values(stepResults).filter(result => result.success).length;
            const totalSteps = workflow.steps.length;
            const status = successfulSteps === totalSteps
                ? 'success'
                : successfulSteps > 0
                    ? 'partial'
                    : 'failure';
            this.websocketGateway.broadcastSystemNotification({
                type: 'workflow_completed',
                workflowId: workflow.id,
                workflowName: workflow.name,
                status,
                sessionId: context.sessionId,
                duration,
                timestamp: endTime.toISOString(),
            });
            const result = {
                workflowId: workflow.id,
                status,
                stepResults,
                duration,
                startTime,
                endTime,
                error: workflowError
            };
            this.logger.log(`Workflow ${workflow.name} completed with status: ${status}`);
            return result;
        }
        catch (error) {
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            this.logger.error(`Workflow ${workflow.name} failed: ${error.message}`, error.stack);
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
    async executeStep(step, context, previousResults) {
        const stepStartTime = new Date();
        this.logger.log(`Executing step: ${step.name} (${step.id}) with agent: ${step.agent}`);
        try {
            const inputData = {
                ...context.sharedData,
                ...step.input,
                previousResults,
                sessionId: context.sessionId
            };
            const result = await this.agentConnector.post(step.agent, inputData, '', {
                timeout: step.timeout || 30000,
                retries: step.retryConfig?.maxAttempts || 1
            });
            const stepEndTime = new Date();
            const duration = stepEndTime.getTime() - stepStartTime.getTime();
            if (result.success) {
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
            }
            else {
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
        }
        catch (error) {
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
    createWorkflow(name, description, steps) {
        return {
            id: `workflow_${Date.now()}`,
            name,
            description,
            steps,
            createdAt: new Date(),
            version: '1.0.0'
        };
    }
    validateWorkflow(workflow) {
        const stepIds = workflow.steps.map(step => step.id);
        const uniqueStepIds = new Set(stepIds);
        if (stepIds.length !== uniqueStepIds.size) {
            this.logger.error('Workflow validation failed: Duplicate step IDs found');
            return false;
        }
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
};
exports.WorkflowEngineService = WorkflowEngineService;
exports.WorkflowEngineService = WorkflowEngineService = WorkflowEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_connector_service_1.AgentConnectorService,
        websocket_gateway_1.WebSocketGatewayService,
        state_management_service_1.StateManagementService])
], WorkflowEngineService);
//# sourceMappingURL=workflow-engine.service.js.map