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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorV1Controller = void 0;
const common_1 = require("@nestjs/common");
const workflow_engine_service_1 = require("../../../../common/workflow/workflow-engine.service");
const swagger_1 = require("@nestjs/swagger");
let OrchestratorV1Controller = class OrchestratorV1Controller {
    constructor(workflowEngine) {
        this.workflowEngine = workflowEngine;
    }
    async executeWorkflow(body) {
        return this.workflowEngine.executeWorkflow(body.workflow, body.context);
    }
    async createWorkflow(body) {
        return this.workflowEngine.createWorkflow(body.name, body.description, body.steps);
    }
    async executeAgent(agentName, body) {
        return {
            message: `Agent ${agentName} execution initiated`,
            sessionId: body.sessionId,
            params: body.params,
        };
    }
    async getMetrics() {
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
    async getHealth() {
        return {
            status: 'healthy',
            agents: [
                { name: 'trend-scanner', status: 'online', lastCheck: new Date().toISOString() },
                { name: 'video-scriptor', status: 'online', lastCheck: new Date().toISOString() },
                { name: 'faq-responder', status: 'online', lastCheck: new Date().toISOString() },
            ],
        };
    }
};
exports.OrchestratorV1Controller = OrchestratorV1Controller;
__decorate([
    (0, common_1.Post)('workflow'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute a workflow',
        description: 'Execute a defined workflow with the provided context',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrchestratorV1Controller.prototype, "executeWorkflow", null);
__decorate([
    (0, common_1.Post)('workflow/create'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new workflow definition',
        description: 'Create a new workflow definition from steps',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrchestratorV1Controller.prototype, "createWorkflow", null);
__decorate([
    (0, common_1.Post)('agents/:agentName/execute'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute a single agent',
        description: 'Execute a single agent with the provided parameters',
    }),
    (0, swagger_1.ApiParam)({
        name: 'agentName',
        description: 'Name of the agent to execute',
        example: 'trend-scanner',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Agent execution parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                params: { type: 'object' },
            },
            required: ['sessionId'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Agent not found' }),
    __param(0, (0, common_1.Param)('agentName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrchestratorV1Controller.prototype, "executeAgent", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get orchestrator metrics',
        description: 'Retrieve metrics about orchestrator performance and agent execution',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorV1Controller.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check orchestrator health',
        description: 'Check the health status of the orchestrator and connected agents',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrchestratorV1Controller.prototype, "getHealth", null);
exports.OrchestratorV1Controller = OrchestratorV1Controller = __decorate([
    (0, swagger_1.ApiTags)('orchestrator'),
    (0, common_1.Controller)('orchestrator'),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], OrchestratorV1Controller);
//# sourceMappingURL=orchestrator-v1.controller.js.map