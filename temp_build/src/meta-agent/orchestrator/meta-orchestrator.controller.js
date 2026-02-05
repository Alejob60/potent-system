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
var MetaOrchestratorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaOrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const meta_orchestrator_service_1 = require("./meta-orchestrator.service");
const workflow_definition_entity_1 = require("./workflow-definition.entity");
const workflow_execution_entity_1 = require("./workflow-execution.entity");
let MetaOrchestratorController = MetaOrchestratorController_1 = class MetaOrchestratorController {
    constructor(orchestratorService) {
        this.orchestratorService = orchestratorService;
        this.logger = new common_1.Logger(MetaOrchestratorController_1.name);
    }
    async createWorkflow(req, body) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const workflow = await this.orchestratorService.createWorkflow(body.name, body.description, body.steps, tenantContext.tenantId, tenantContext.siteId, body.metadata);
            return {
                success: true,
                data: workflow,
                message: 'Workflow created successfully'
            };
        }
        catch (error) {
            this.logger.error('Error creating workflow', error.stack);
            throw error;
        }
    }
    async activateWorkflow(req, workflowId) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const workflow = await this.orchestratorService.activateWorkflow(workflowId, tenantContext.tenantId);
            return {
                success: true,
                data: workflow,
                message: 'Workflow activated successfully'
            };
        }
        catch (error) {
            this.logger.error('Error activating workflow', error.stack);
            throw error;
        }
    }
    async executeWorkflow(req, workflowId, body) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const context = {
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
        }
        catch (error) {
            this.logger.error('Error executing workflow', error.stack);
            throw error;
        }
    }
    async getWorkflow(req, workflowId) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const workflow = await this.orchestratorService.getWorkflow(workflowId, tenantContext.tenantId);
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
        }
        catch (error) {
            this.logger.error('Error retrieving workflow', error.stack);
            throw error;
        }
    }
    async listWorkflows(req, status, limit = 50, offset = 0) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const [workflows, total] = await this.orchestratorService.listWorkflows(tenantContext.tenantId, status, limit, offset);
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
        }
        catch (error) {
            this.logger.error('Error listing workflows', error.stack);
            throw error;
        }
    }
    async getExecution(req, executionId) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const execution = await this.orchestratorService.getExecution(executionId, tenantContext.tenantId);
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
        }
        catch (error) {
            this.logger.error('Error retrieving execution', error.stack);
            throw error;
        }
    }
    async listExecutions(req, workflowId, status, limit = 50, offset = 0) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const [executions, total] = await this.orchestratorService.listExecutions(tenantContext.tenantId, workflowId, status, limit, offset);
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
        }
        catch (error) {
            this.logger.error('Error listing executions', error.stack);
            throw error;
        }
    }
    async cancelExecution(req, executionId) {
        try {
            const tenantContext = req.tenantContext;
            if (!tenantContext) {
                throw new Error('Tenant context not found');
            }
            const result = await this.orchestratorService.cancelExecution(executionId, tenantContext.tenantId);
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
        }
        catch (error) {
            this.logger.error('Error cancelling execution', error.stack);
            throw error;
        }
    }
};
exports.MetaOrchestratorController = MetaOrchestratorController;
__decorate([
    (0, common_1.Post)('workflows'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new workflow' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Workflow created successfully',
        type: workflow_definition_entity_1.WorkflowDefinitionEntity
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "createWorkflow", null);
__decorate([
    (0, common_1.Put)('workflows/:workflowId/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a workflow' }),
    (0, swagger_1.ApiParam)({ name: 'workflowId', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow activated successfully',
        type: workflow_definition_entity_1.WorkflowDefinitionEntity
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "activateWorkflow", null);
__decorate([
    (0, common_1.Post)('workflows/:workflowId/execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a workflow' }),
    (0, swagger_1.ApiParam)({ name: 'workflowId', type: 'string' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow execution started successfully'
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "executeWorkflow", null);
__decorate([
    (0, common_1.Get)('workflows/:workflowId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get workflow by ID' }),
    (0, swagger_1.ApiParam)({ name: 'workflowId', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflow retrieved successfully',
        type: workflow_definition_entity_1.WorkflowDefinitionEntity
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "getWorkflow", null);
__decorate([
    (0, common_1.Get)('workflows'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'List workflows' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: 'number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Workflows retrieved successfully'
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "listWorkflows", null);
__decorate([
    (0, common_1.Get)('executions/:executionId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get execution by ID' }),
    (0, swagger_1.ApiParam)({ name: 'executionId', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Execution retrieved successfully',
        type: workflow_execution_entity_1.WorkflowExecutionEntity
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "getExecution", null);
__decorate([
    (0, common_1.Get)('executions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'List executions' }),
    (0, swagger_1.ApiQuery)({ name: 'workflowId', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: 'number' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Executions retrieved successfully'
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('workflowId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "listExecutions", null);
__decorate([
    (0, common_1.Delete)('executions/:executionId/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a workflow execution' }),
    (0, swagger_1.ApiParam)({ name: 'executionId', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Execution cancelled successfully'
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MetaOrchestratorController.prototype, "cancelExecution", null);
exports.MetaOrchestratorController = MetaOrchestratorController = MetaOrchestratorController_1 = __decorate([
    (0, swagger_1.ApiTags)('Meta-Agent - Orchestration'),
    (0, common_1.Controller)('v1/meta-agent/orchestrator'),
    __metadata("design:paramtypes", [meta_orchestrator_service_1.MetaOrchestratorService])
], MetaOrchestratorController);
//# sourceMappingURL=meta-orchestrator.controller.js.map