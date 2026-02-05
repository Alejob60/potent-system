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
var AgentHealthCheckJob_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentHealthCheckJob = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const admin_orchestrator_service_1 = require("../agents/admin/services/admin-orchestrator.service");
let AgentHealthCheckJob = AgentHealthCheckJob_1 = class AgentHealthCheckJob {
    constructor(adminOrchestratorService) {
        this.adminOrchestratorService = adminOrchestratorService;
        this.logger = new common_1.Logger(AgentHealthCheckJob_1.name);
    }
    async handleAgentHealthCheck() {
        this.logger.log('Iniciando verificaci n de salud de agentes');
        const agentMap = this.adminOrchestratorService.agentMap;
        const healthStatus = {};
        for (const [agentName, url] of Object.entries(agentMap)) {
            const isHealthy = await this.adminOrchestratorService.checkAgentHealth(url);
            healthStatus[agentName] = isHealthy;
            if (!isHealthy) {
                this.logger.warn(`Agente ${agentName} (${url}) no est  saludable`);
            }
            else {
                this.logger.log(`Agente ${agentName} (${url}) est  saludable`);
            }
        }
        this.logger.log('Estado de salud de agentes:', JSON.stringify(healthStatus, null, 2));
    }
};
exports.AgentHealthCheckJob = AgentHealthCheckJob;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentHealthCheckJob.prototype, "handleAgentHealthCheck", null);
exports.AgentHealthCheckJob = AgentHealthCheckJob = AgentHealthCheckJob_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_orchestrator_service_1.AdminOrchestratorService])
], AgentHealthCheckJob);
//# sourceMappingURL=agent-health-check.job.js.map