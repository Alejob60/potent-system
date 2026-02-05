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
exports.AgentAnalyticsReporterController = void 0;
const common_1 = require("@nestjs/common");
const agent_analytics_reporter_service_1 = require("../services/agent-analytics-reporter.service");
const create_agent_analytics_reporter_dto_1 = require("../dto/create-agent-analytics-reporter.dto");
const swagger_1 = require("@nestjs/swagger");
let AgentAnalyticsReporterController = class AgentAnalyticsReporterController {
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
exports.AgentAnalyticsReporterController = AgentAnalyticsReporterController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate analytics reports',
        description: 'Create comprehensive analytics reports based on specified metrics and time periods',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Analytics report generation parameters',
        schema: {
            type: 'object',
            properties: {
                sessionId: { type: 'string', example: 'user-session-123' },
                reportType: {
                    type: 'string',
                    example: 'performance',
                    description: 'Type of report (performance, audience, comparison, custom)',
                },
                timePeriod: {
                    type: 'string',
                    example: 'last_30_days',
                    description: 'Time period for analysis (last_7_days, last_30_days, custom)',
                },
                metrics: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['engagement_rate', 'reach', 'impressions'],
                    description: 'Specific metrics to include in the report',
                },
                format: {
                    type: 'string',
                    example: 'pdf',
                    description: 'Output format (pdf, csv, json, dashboard)',
                },
                platform: {
                    type: 'string',
                    example: 'all',
                    description: 'Social media platform (all, instagram, facebook, twitter, etc.)',
                },
            },
            required: ['sessionId', 'reportType', 'timePeriod'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Analytics report generated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid-123' },
                sessionId: { type: 'string', example: 'user-session-123' },
                status: { type: 'string', example: 'completed' },
                result: {
                    type: 'object',
                    properties: {
                        reportUrl: {
                            type: 'string',
                            example: 'https://reports.example.com/report.pdf',
                        },
                        metrics: {
                            type: 'object',
                            properties: {
                                engagementRate: { type: 'number', example: 4.2 },
                                reach: { type: 'number', example: 15000 },
                                impressions: { type: 'number', example: 65000 },
                            },
                        },
                        insights: { type: 'array', items: { type: 'string' } },
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
    __metadata("design:paramtypes", [create_agent_analytics_reporter_dto_1.CreateAgentAnalyticsReporterDto]),
    __metadata("design:returntype", Promise)
], AgentAnalyticsReporterController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all analytics reports',
        description: 'Retrieve a list of all analytics reports generated by this agent',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of analytics reports',
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
], AgentAnalyticsReporterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get analytics report by ID',
        description: 'Retrieve details of a specific analytics report by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Analytics report ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics report details',
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
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Analytics report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentAnalyticsReporterController.prototype, "findOne", null);
exports.AgentAnalyticsReporterController = AgentAnalyticsReporterController = __decorate([
    (0, swagger_1.ApiTags)('analytics-reporter'),
    (0, common_1.Controller)('agents/analytics-reporter'),
    __metadata("design:paramtypes", [agent_analytics_reporter_service_1.AgentAnalyticsReporterService])
], AgentAnalyticsReporterController);
//# sourceMappingURL=agent-analytics-reporter.controller.js.map