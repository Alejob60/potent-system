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
exports.AgentAnalyticsReporterV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agent_analytics_reporter_v2_service_1 = require("../services/agent-analytics-reporter-v2.service");
const create_agent_analytics_reporter_dto_1 = require("../dto/create-agent-analytics-reporter.dto");
let AgentAnalyticsReporterV2Controller = class AgentAnalyticsReporterV2Controller {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async execute(dto) {
        return this.agentService.execute(dto);
    }
    async getMetrics() {
        return this.agentService.getMetrics();
    }
    async findOne(id) {
        return this.agentService.findOne(id);
    }
    async findAll() {
        return this.agentService.findAll();
    }
};
exports.AgentAnalyticsReporterV2Controller = AgentAnalyticsReporterV2Controller;
__decorate([
    (0, common_1.Post)('execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Execute analytics report generation' }),
    (0, swagger_1.ApiBody)({ type: create_agent_analytics_reporter_dto_1.CreateAgentAnalyticsReporterDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics report generated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_analytics_reporter_dto_1.CreateAgentAnalyticsReporterDto]),
    __metadata("design:returntype", Promise)
], AgentAnalyticsReporterV2Controller.prototype, "execute", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent metrics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent metrics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentAnalyticsReporterV2Controller.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytics report by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Analytics report ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics report retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Analytics report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentAnalyticsReporterV2Controller.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all analytics reports' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All analytics reports retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentAnalyticsReporterV2Controller.prototype, "findAll", null);
exports.AgentAnalyticsReporterV2Controller = AgentAnalyticsReporterV2Controller = __decorate([
    (0, swagger_1.ApiTags)('Agent - Analytics Reporter V2'),
    (0, common_1.Controller)('api/v2/agent/analytics-reporter'),
    __metadata("design:paramtypes", [agent_analytics_reporter_v2_service_1.AgentAnalyticsReporterV2Service])
], AgentAnalyticsReporterV2Controller);
//# sourceMappingURL=agent-analytics-reporter-v2.controller.js.map