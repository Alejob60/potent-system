"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSpecializedIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const agent_customer_support_module_1 = require("../agent-customer-support/agent-customer-support.module");
const agent_sales_assistant_module_1 = require("../agent-sales-assistant/agent-sales-assistant.module");
const agent_marketing_automation_module_1 = require("../agent-marketing-automation/agent-marketing-automation.module");
const agent_analytics_reporting_module_1 = require("../agent-analytics-reporting/agent-analytics-reporting.module");
const agent_specialized_integration_service_1 = require("./services/agent-specialized-integration.service");
const agent_specialized_integration_controller_1 = require("./controllers/agent-specialized-integration.controller");
const redis_module_1 = require("../../common/redis/redis.module");
const state_module_1 = require("../../state/state.module");
const websocket_module_1 = require("../../websocket/websocket.module");
let AgentSpecializedIntegrationModule = class AgentSpecializedIntegrationModule {
};
exports.AgentSpecializedIntegrationModule = AgentSpecializedIntegrationModule;
exports.AgentSpecializedIntegrationModule = AgentSpecializedIntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            agent_customer_support_module_1.AgentCustomerSupportModule,
            agent_sales_assistant_module_1.AgentSalesAssistantModule,
            agent_marketing_automation_module_1.AgentMarketingAutomationModule,
            agent_analytics_reporting_module_1.AgentAnalyticsReportingModule,
            redis_module_1.RedisModule,
            state_module_1.StateModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [agent_specialized_integration_controller_1.AgentSpecializedIntegrationController],
        providers: [agent_specialized_integration_service_1.AgentSpecializedIntegrationService],
        exports: [
            agent_customer_support_module_1.AgentCustomerSupportModule,
            agent_sales_assistant_module_1.AgentSalesAssistantModule,
            agent_marketing_automation_module_1.AgentMarketingAutomationModule,
            agent_analytics_reporting_module_1.AgentAnalyticsReportingModule,
            agent_specialized_integration_service_1.AgentSpecializedIntegrationService,
        ],
    })
], AgentSpecializedIntegrationModule);
//# sourceMappingURL=agent-specialized-integration.module.js.map