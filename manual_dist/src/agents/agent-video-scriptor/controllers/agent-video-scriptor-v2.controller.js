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
exports.AgentVideoScriptorV2Controller = void 0;
const common_1 = require("@nestjs/common");
const agent_video_scriptor_v2_service_1 = require("../services/agent-video-scriptor-v2.service");
const create_agent_video_scriptor_dto_1 = require("../dto/create-agent-video-scriptor.dto");
const swagger_1 = require("@nestjs/swagger");
let AgentVideoScriptorV2Controller = class AgentVideoScriptorV2Controller {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.execute(dto);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async findBySession(sessionId) {
        return this.service.findBySessionId(sessionId);
    }
    async getMetrics() {
        return this.service.getMetrics();
    }
};
exports.AgentVideoScriptorV2Controller = AgentVideoScriptorV2Controller;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate emotional video script (V2)',
        description: 'Generate platform-adapted scripts based on emotion and campaign objectives with enhanced capabilities',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Script generation parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                emotion: {
                    type: 'string',
                    example: 'excited',
                    description: 'Emotional tone for the script',
                },
                platform: {
                    type: 'string',
                    example: 'tiktok',
                    description: 'Target platform for the script',
                },
                format: {
                    type: 'string',
                    example: 'unboxing',
                    description: 'Content format',
                },
                objective: {
                    type: 'string',
                    example: 'product_launch',
                    description: 'Campaign objective',
                },
                product: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Kimisoft Pulse' },
                        features: {
                            type: 'array',
                            items: { type: 'string' },
                            example: [
                                'automatizaci n emocional',
                                'trazabilidad de m tricas',
                                'interfaz intuitiva',
                            ],
                        },
                    },
                },
            },
            required: ['sessionId', 'emotion', 'platform', 'format', 'product'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Script generated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        creation: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                sessionId: { type: 'string' },
                                status: { type: 'string' },
                                createdAt: { type: 'string', format: 'date-time' },
                            },
                        },
                        script: { type: 'string' },
                        narrative: { type: 'string' },
                        suggestions: { type: 'object' },
                        visualStyle: { type: 'object' },
                        compressedScript: { type: 'string' },
                    },
                },
                metrics: {
                    type: 'object',
                    properties: {
                        requestsProcessed: { type: 'number' },
                        successRate: { type: 'number' },
                        avgResponseTime: { type: 'number' },
                        errors: { type: 'number' },
                        lastActive: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_video_scriptor_dto_1.CreateAgentVideoScriptorDto]),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorV2Controller.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all video creations (V2)',
        description: 'Retrieve a list of all video creations performed by this agent',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of video creations',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    sessionId: { type: 'string' },
                    status: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorV2Controller.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get video creation by ID (V2)',
        description: 'Retrieve details of a specific video creation by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Video creation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Video creation details',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                sessionId: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Video creation not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorV2Controller.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get scripts by session (V2)',
        description: 'Retrieve all scripts created during a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Scripts for session',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    sessionId: { type: 'string' },
                    status: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorV2Controller.prototype, "findBySession", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get agent metrics (V2)',
        description: 'Retrieve performance metrics for this agent',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent metrics',
        schema: {
            type: 'object',
            properties: {
                totalScripts: { type: 'number' },
                dbSuccessRate: { type: 'number' },
                dbFailureRate: { type: 'number' },
                averageGenerationTime: { type: 'number' },
                requestsProcessed: { type: 'number' },
                avgResponseTime: { type: 'number' },
                errors: { type: 'number' },
                lastActive: { type: 'string', format: 'date-time' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorV2Controller.prototype, "getMetrics", null);
exports.AgentVideoScriptorV2Controller = AgentVideoScriptorV2Controller = __decorate([
    (0, swagger_1.ApiTags)('agents'),
    (0, common_1.Controller)('v2/agents/video-scriptor'),
    __metadata("design:paramtypes", [agent_video_scriptor_v2_service_1.AgentVideoScriptorV2Service])
], AgentVideoScriptorV2Controller);
//# sourceMappingURL=agent-video-scriptor-v2.controller.js.map