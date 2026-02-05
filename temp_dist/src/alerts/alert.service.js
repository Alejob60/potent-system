"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AlertService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const common_1 = require("@nestjs/common");
let AlertService = AlertService_1 = class AlertService {
    constructor() {
        this.logger = new common_1.Logger(AlertService_1.name);
        this.failureCount = new Map();
    }
    async checkAgentFailures(agentName, isHealthy) {
        if (!isHealthy) {
            const currentFailures = this.failureCount.get(agentName) || 0;
            const newFailures = currentFailures + 1;
            this.failureCount.set(agentName, newFailures);
            this.logger.warn(`Agente ${agentName} ha fallado ${newFailures} veces consecutivas`);
            if (newFailures >= 2) {
                await this.sendAlert(`Alerta: Agente ${agentName} ha fallado ${newFailures} veces consecutivas`);
            }
        }
        else {
            this.failureCount.set(agentName, 0);
        }
    }
    async sendAlert(message) {
        this.logger.error(`ALERTA CR TICA: ${message}`);
    }
    async sendEmailAlert(message) {
        this.logger.log(`Enviando alerta por email: ${message}`);
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = AlertService_1 = __decorate([
    (0, common_1.Injectable)()
], AlertService);
//# sourceMappingURL=alert.service.js.map