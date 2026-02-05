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
exports.AgentSalesAssistantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agent_sales_assistant_service_1 = require("../services/agent-sales-assistant.service");
const create_agent_sales_assistant_dto_1 = require("../dto/create-agent-sales-assistant.dto");
let AgentSalesAssistantController = class AgentSalesAssistantController {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async qualifyLead(createDto) {
        return this.agentService.execute(createDto);
    }
    async findOne(id) {
        return this.agentService.findOne(id);
    }
    async findBySessionId(sessionId) {
        return this.agentService.findBySessionId(sessionId);
    }
    async findAll(query) {
        return this.agentService.findAll();
    }
    async getMetrics() {
        return this.agentService.getMetrics();
    }
};
exports.AgentSalesAssistantController = AgentSalesAssistantController;
__decorate([
    (0, common_1.Post)('qualify'),
    (0, swagger_1.ApiOperation)({ summary: 'Qualify sales lead' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sales lead qualified successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agent_sales_assistant_dto_1.CreateAgentSalesAssistantDto]),
    __metadata("design:returntype", Promise)
], AgentSalesAssistantController.prototype, "qualifyLead", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales qualification by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales qualification retrieved successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sales qualification not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentSalesAssistantController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales qualifications by session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales qualifications retrieved successfully.' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentSalesAssistantController.prototype, "findBySessionId", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sales qualifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales qualifications retrieved successfully.' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentSalesAssistantController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Agent metrics retrieved successfully.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentSalesAssistantController.prototype, "getMetrics", null);
exports.AgentSalesAssistantController = AgentSalesAssistantController = __decorate([
    (0, swagger_1.ApiTags)('Agent - Sales Assistant'),
    (0, common_1.Controller)('agent/sales-assistant'),
    __metadata("design:paramtypes", [agent_sales_assistant_service_1.AgentSalesAssistantService])
], AgentSalesAssistantController);
//# sourceMappingURL=agent-sales-assistant.controller.js.map