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
exports.AgentTrendScannerController = void 0;
const common_1 = require("@nestjs/common");
const agent_trend_scanner_service_1 = require("../services/agent-trend-scanner.service");
const create_agent_trend_scanner_dto_1 = require("../dto/create-agent-trend-scanner.dto");
const swagger_1 = require("@nestjs/swagger");
let AgentTrendScannerController = class AgentTrendScannerController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
};
exports.AgentTrendScannerController = AgentTrendScannerController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Analyze social media trends',
        description: 'Analyze current trends on social media platforms for specific topics or keywords',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Trend analysis parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                platform: {
                    type: 'string',
                    example: 'tiktok',
                    description: 'Target social media platform (tiktok, instagram, twitter, etc.)',
                },
                topic: {
                    type: 'string',
                    example: 'sustainable fashion',
                    description: 'Topic or keyword to analyze trends for',
                },
                dateRange: {
                    type: 'string',
                    example: 'last_7_days',
                    description: 'Time period for analysis (last_7_days, last_30_days, custom)',
                },
                detailLevel: {
                    type: 'string',
                    example: 'comprehensive',
                    description: 'Level of detail (basic, standard, comprehensive)',
                },
                region: {
                    type: 'string',
                    example: 'global',
                    description: 'Geographic region for trend analysis',
                },
            },
            required: ['sessionId', 'platform', 'topic'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Trend analysis completed successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid-123' },
                sessionId: { type: 'string', example: 'user-session-123' },
                status: { type: 'string', example: 'completed' },
                result: {
                    type: 'object',
                    properties: {
                        trends: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    keyword: { type: 'string' },
                                    volume: { type: 'number' },
                                    growth: { type: 'number' },
                                    relatedTerms: { type: 'array', items: { type: 'string' } },
                                },
                            },
                        },
                        insights: { type: 'string' },
                        recommendations: { type: 'array', items: { type: 'string' } },
                    },
                },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_trend_scanner_dto_1.CreateAgentTrendScannerDto]),
    __metadata("design:returntype", Promise)
], AgentTrendScannerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all trend analyses',
        description: 'Retrieve a list of all trend analyses performed by this agent',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of trend analyses',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    sessionId: { type: 'string' },
                    status: { type: 'string' },
                    result: { type: 'object' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentTrendScannerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get trend analysis by ID',
        description: 'Retrieve details of a specific trend analysis by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Trend analysis ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Trend analysis details',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                sessionId: { type: 'string' },
                status: { type: 'string' },
                result: { type: 'object' },
                createdAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Trend analysis not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentTrendScannerController.prototype, "findOne", null);
exports.AgentTrendScannerController = AgentTrendScannerController = __decorate([
    (0, swagger_1.ApiTags)('trend-scanner'),
    (0, common_1.Controller)('agents/trend-scanner'),
    __metadata("design:paramtypes", [agent_trend_scanner_service_1.AgentTrendScannerService])
], AgentTrendScannerController);
//# sourceMappingURL=agent-trend-scanner.controller.js.map