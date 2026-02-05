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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTestController = void 0;
const common_1 = require("@nestjs/common");
const agent_functionality_test_service_1 = require("./agent-functionality-test.service");
const swagger_1 = require("@nestjs/swagger");
let AgentTestController = class AgentTestController {
    constructor(testService) {
        this.testService = testService;
    }
    async getAgentStatus() {
        const statuses = await this.testService.testAllAgents();
        return {
            timestamp: new Date().toISOString(),
            agents: statuses,
        };
    }
    async getAgentReport() {
        const statuses = await this.testService.testAllAgents();
        return this.testService.generateReport(statuses);
    }
    async runAgentTests() {
        const statuses = await this.testService.testAllAgents();
        return {
            timestamp: new Date().toISOString(),
            results: statuses,
            summary: {
                total: statuses.length,
                complete: statuses.filter(s => s.status === 'complete').length,
                incomplete: statuses.filter(s => s.status === 'incomplete').length,
                partial: statuses.filter(s => s.status === 'partial').length,
            },
        };
    }
};
exports.AgentTestController = AgentTestController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get agent functionality status',
        description: 'Retrieve the current status of all agents and their components',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Agent status report',
        schema: {
            type: 'object',
            properties: {
                timestamp: { type: 'string', format: 'date-time' },
                agents: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            endpoints: { type: 'array', items: { type: 'string' } },
                            status: { type: 'string', enum: ['complete', 'incomplete', 'partial'] },
                            missingComponents: { type: 'array', items: { type: 'string' } },
                            notes: { type: 'array', items: { type: 'string' } },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentTestController.prototype, "getAgentStatus", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get detailed agent report',
        description: 'Retrieve a detailed report of all agents in markdown format',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Detailed agent report',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentTestController.prototype, "getAgentReport", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, swagger_1.ApiOperation)({
        summary: 'Run agent functionality tests',
        description: 'Execute comprehensive tests on all agents and return results',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Test results',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentTestController.prototype, "runAgentTests", null);
exports.AgentTestController = AgentTestController = __decorate([
    (0, swagger_1.ApiTags)('agent-testing'),
    (0, common_1.Controller)('agent-testing'),
    __metadata("design:paramtypes", [agent_functionality_test_service_1.AgentFunctionalityTestService])
], AgentTestController);
//# sourceMappingURL=agent-test.controller.js.map