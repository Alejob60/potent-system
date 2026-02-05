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
exports.AdminOrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const admin_orchestrator_service_1 = require("../services/admin-orchestrator.service");
const agent_orchestration_dto_1 = require("../dto/agent-orchestration.dto");
const swagger_1 = require("@nestjs/swagger");
let AdminOrchestratorController = class AdminOrchestratorController {
    constructor(service) {
        this.service = service;
    }
    async orchestrate(dto) {
        return this.service.orchestrate(dto);
    }
};
exports.AdminOrchestratorController = AdminOrchestratorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Orchestrate AI agents',
        description: 'Coordinate multiple AI agents to perform complex tasks based on user requests',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Agent orchestration parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                task: {
                    type: 'string',
                    example: 'Create a social media campaign for our new product launch',
                },
                context: {
                    type: 'object',
                    properties: {
                        businessInfo: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', example: 'MisyBot' },
                                location: { type: 'string', example: 'San Francisco, CA' },
                            },
                        },
                        targetChannels: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['instagram', 'facebook', 'twitter'],
                        },
                        currentObjective: {
                            type: 'string',
                            example: 'Increase brand awareness',
                        },
                        preferences: {
                            type: 'object',
                            properties: {
                                contentTypes: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['video', 'image', 'text'],
                                },
                                tone: { type: 'string', example: 'professional' },
                                frequency: { type: 'string', example: 'daily' },
                            },
                        },
                    },
                },
                agents: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['trend-scanner', 'video-scriptor', 'post-scheduler'],
                },
            },
            required: ['sessionId', 'task'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Agents orchestrated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_orchestration_dto_1.AgentOrchestrationDto]),
    __metadata("design:returntype", Promise)
], AdminOrchestratorController.prototype, "orchestrate", null);
exports.AdminOrchestratorController = AdminOrchestratorController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin/orchestrate'),
    __metadata("design:paramtypes", [admin_orchestrator_service_1.AdminOrchestratorService])
], AdminOrchestratorController);
//# sourceMappingURL=admin-orchestrator.controller.js.map