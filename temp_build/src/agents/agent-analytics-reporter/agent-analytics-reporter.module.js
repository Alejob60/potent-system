"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentAnalyticsReporterModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_analytics_reporter_entity_1 = require("./entities/agent-analytics-reporter.entity");
const agent_analytics_reporter_service_1 = require("./services/agent-analytics-reporter.service");
const agent_analytics_reporter_controller_1 = require("./controllers/agent-analytics-reporter.controller");
let AgentAnalyticsReporterModule = class AgentAnalyticsReporterModule {
};
exports.AgentAnalyticsReporterModule = AgentAnalyticsReporterModule;
exports.AgentAnalyticsReporterModule = AgentAnalyticsReporterModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_analytics_reporter_entity_1.AgentAnalyticsReporter])],
        providers: [agent_analytics_reporter_service_1.AgentAnalyticsReporterService],
        controllers: [agent_analytics_reporter_controller_1.AgentAnalyticsReporterController],
    })
], AgentAnalyticsReporterModule);
//# sourceMappingURL=agent-analytics-reporter.module.js.map