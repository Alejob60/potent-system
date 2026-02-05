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
exports.AgentSpecializedIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agent_specialized_integration_service_1 = require("../services/agent-specialized-integration.service");
let AgentSpecializedIntegrationController = class AgentSpecializedIntegrationController {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async coordinateAgents(payload) {
        return this.agentService.execute(payload);
    }
    async getMetrics() {
        return this.agentService.getCombinedMetrics();
    }
    async getStatus() {
        return this.agentService.getAgentStatuses();
    }
};
exports.AgentSpecializedIntegrationController = AgentSpecializedIntegrationController;
__decorate([
    (0, common_1.Post)('coordinate'),
    (0, swagger_1.ApiOperation)({ summary: 'Coordinate specialized agents' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Agents coordinated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentSpecializedIntegrationController.prototype, "coordinateAgents", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get combined agent metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Combined metrics retrieved successfully.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentSpecializedIntegrationController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent statuses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Agent statuses retrieved successfully.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentSpecializedIntegrationController.prototype, "getStatus", null);
exports.AgentSpecializedIntegrationController = AgentSpecializedIntegrationController = __decorate([
    (0, swagger_1.ApiTags)('Agent - Specialized Integration'),
    (0, common_1.Controller)('agent/specialized-integration'),
    __metadata("design:paramtypes", [agent_specialized_integration_service_1.AgentSpecializedIntegrationService])
], AgentSpecializedIntegrationController);
//# sourceMappingURL=agent-specialized-integration.controller.js.map