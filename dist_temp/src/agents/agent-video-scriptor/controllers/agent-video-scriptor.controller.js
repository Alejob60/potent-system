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
exports.AgentVideoScriptorController = void 0;
const common_1 = require("@nestjs/common");
const agent_video_scriptor_service_1 = require("../services/agent-video-scriptor.service");
const create_agent_video_scriptor_dto_1 = require("../dto/create-agent-video-scriptor.dto");
const swagger_1 = require("@nestjs/swagger");
let AgentVideoScriptorController = class AgentVideoScriptorController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async findBySessionId(sessionId) {
        return this.service.findBySessionId(sessionId);
    }
    async getMetrics() {
        return this.service.getMetrics();
    }
    async findAll() {
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
};
exports.AgentVideoScriptorController = AgentVideoScriptorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Genera gui n emocional',
        description: 'Genera un gui n adaptado por plataforma, emoci n y objetivo de campa a',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Par metros para la generaci n del gui n',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                emotion: {
                    type: 'string',
                    example: 'excited',
                    description: 'Emoci n detectada (ej. "excited", "curious", "focused")',
                },
                platform: {
                    type: 'string',
                    example: 'tiktok',
                    description: 'Plataforma destino (ej. "tiktok", "shorts", "reels")',
                },
                format: {
                    type: 'string',
                    example: 'unboxing',
                    description: 'Formato viral sugerido (ej. "unboxing", "reaction")',
                },
                objective: {
                    type: 'string',
                    example: 'product_launch',
                    description: 'Objetivo de campa a (ej. "product_launch", "event", "promotion")',
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
                    required: ['name', 'features'],
                },
            },
            required: [
                'sessionId',
                'emotion',
                'platform',
                'format',
                'objective',
                'product',
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Gui n generado exitosamente',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid-123' },
                sessionId: { type: 'string', example: 'user-session-123' },
                emotion: { type: 'string', example: 'excited' },
                platform: { type: 'string', example: 'tiktok' },
                format: { type: 'string', example: 'unboxing' },
                objective: { type: 'string', example: 'product_launch' },
                product: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        features: { type: 'array', items: { type: 'string' } },
                    },
                },
                script: { type: 'string', example: 'Gui n generado...' },
                narrative: { type: 'string', example: 'Narrativa emocional...' },
                suggestions: {
                    type: 'object',
                    properties: {
                        style: { type: 'string' },
                        pace: { type: 'string' },
                        effects: { type: 'string' },
                        music: { type: 'string' },
                    },
                },
                status: { type: 'string', example: 'completed' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Par metros inv lidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_video_scriptor_dto_1.CreateAgentVideoScriptorDto]),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Devuelve guiones por sesi n',
        description: 'Obtiene todos los guiones generados para una sesi n espec fica',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'ID de la sesi n del usuario',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de guiones por sesi n',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    sessionId: { type: 'string' },
                    emotion: { type: 'string' },
                    platform: { type: 'string' },
                    format: { type: 'string' },
                    objective: { type: 'string' },
                    product: { type: 'string' },
                    script: { type: 'string' },
                    narrative: { type: 'string' },
                    suggestions: { type: 'string' },
                    status: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sesi n no encontrada' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorController.prototype, "findBySessionId", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'M tricas del agente',
        description: 'Obtiene m tricas de rendimiento del Video Scriptor Agent',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'M tricas del agente',
        schema: {
            type: 'object',
            properties: {
                totalScripts: { type: 'number', example: 42 },
                successRate: { type: 'number', example: 95.2 },
                failureRate: { type: 'number', example: 4.8 },
                averageGenerationTime: { type: 'number', example: 5.2 },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all video creations',
        description: 'Retrieve a list of all video content created by this agent',
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
                    emotion: { type: 'string' },
                    platform: { type: 'string' },
                    format: { type: 'string' },
                    objective: { type: 'string' },
                    product: { type: 'string' },
                    script: { type: 'string' },
                    narrative: { type: 'string' },
                    suggestions: { type: 'string' },
                    status: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get video creation by ID',
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
                emotion: { type: 'string' },
                platform: { type: 'string' },
                format: { type: 'string' },
                objective: { type: 'string' },
                product: { type: 'string' },
                script: { type: 'string' },
                narrative: { type: 'string' },
                suggestions: { type: 'string' },
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Video creation not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentVideoScriptorController.prototype, "findOne", null);
exports.AgentVideoScriptorController = AgentVideoScriptorController = __decorate([
    (0, swagger_1.ApiTags)('video-scriptor'),
    (0, common_1.Controller)('agents/video-scriptor'),
    __metadata("design:paramtypes", [agent_video_scriptor_service_1.AgentVideoScriptorService])
], AgentVideoScriptorController);
//# sourceMappingURL=agent-video-scriptor.controller.js.map