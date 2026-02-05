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
exports.AgentSpecializedIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const agent_base_1 = require("../../../common/agents/agent-base");
const redis_service_1 = require("../../../common/redis/redis.service");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const agent_customer_support_service_1 = require("../../agent-customer-support/services/agent-customer-support.service");
const agent_sales_assistant_service_1 = require("../../agent-sales-assistant/services/agent-sales-assistant.service");
const agent_marketing_automation_service_1 = require("../../agent-marketing-automation/services/agent-marketing-automation.service");
const agent_analytics_reporting_service_1 = require("../../agent-analytics-reporting/services/agent-analytics-reporting.service");
let AgentSpecializedIntegrationService = class AgentSpecializedIntegrationService extends agent_base_1.AgentBase {
    constructor(customerSupportService, salesAssistantService, marketingAutomationService, analyticsReportingService, redisService, stateManager, websocketGateway) {
        super('specialized-integration', 'Coordinate specialized agents based on request type', ['agent_coordination', 'request_routing', 'response_integration'], redisService, stateManager, websocketGateway);
        this.customerSupportService = customerSupportService;
        this.salesAssistantService = salesAssistantService;
        this.marketingAutomationService = marketingAutomationService;
        this.analyticsReportingService = analyticsReportingService;
    }
    async execute(payload) {
        const startTime = Date.now();
        try {
            if (!(await this.validate(payload))) {
                return this.handleError(new Error('Invalid payload'), 'execute.validate');
            }
            this.logActivity(payload.sessionId || 'unknown', 'Starting specialized agent coordination', payload);
            if (this.websocketGateway) {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_processing',
                    agent: this.config.name,
                    sessionId: payload.sessionId || 'unknown',
                    message: 'Coordinating specialized agents',
                    timestamp: new Date().toISOString(),
                });
            }
            const result = await this.coordinateAgents(payload);
            const processingTime = Date.now() - startTime;
            this.updateMetrics({
                avgResponseTime: processingTime,
            });
            this.logActivity(payload.sessionId || 'unknown', 'Specialized agent coordination completed', { processingTime, agentUsed: result.agentUsed });
            return this.formatResponse({
                coordinatedResponse: result.coordinatedResponse,
                agentUsed: result.agentUsed,
                confidenceScore: result.confidenceScore,
            });
        }
        catch (error) {
            return this.handleError(error, 'execute');
        }
    }
    async validate(payload) {
        if (!payload)
            return false;
        if (!payload.requestType)
            return false;
        return true;
    }
    async coordinateAgents(payload) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const requestType = payload.requestType.toLowerCase();
        let agentResponse;
        let agentUsed;
        if (requestType.includes('support') || requestType.includes('help') || requestType.includes('issue')) {
            agentUsed = 'customer-support';
            agentResponse = await this.customerSupportService.execute({
                sessionId: payload.sessionId,
                customerQuery: payload.query || payload.content || 'General support request',
                customerEmail: payload.email,
                customerId: payload.customerId,
                status: 'processing',
            });
        }
        else if (requestType.includes('sales') || requestType.includes('lead') || requestType.includes('demo')) {
            agentUsed = 'sales-assistant';
            agentResponse = await this.salesAssistantService.execute({
                sessionId: payload.sessionId,
                leadInformation: payload.query || payload.content || 'General sales inquiry',
                leadEmail: payload.email,
                leadName: payload.name,
                company: payload.company,
                industry: payload.industry,
                status: 'processing',
            });
        }
        else if (requestType.includes('marketing') || requestType.includes('campaign') || requestType.includes('promotion')) {
            agentUsed = 'marketing-automation';
            agentResponse = await this.marketingAutomationService.execute({
                sessionId: payload.sessionId,
                campaignObjective: payload.query || payload.content || 'General marketing request',
                targetAudience: payload.audience,
                industry: payload.industry,
                timeline: payload.timeline,
                channels: payload.channels,
                status: 'processing',
            });
        }
        else if (requestType.includes('analytics') || requestType.includes('report') || requestType.includes('insight')) {
            agentUsed = 'analytics-reporting';
            agentResponse = await this.analyticsReportingService.execute({
                sessionId: payload.sessionId,
                reportType: payload.query || payload.content || 'General analytics request',
                dateRange: payload.dateRange,
                metrics: payload.metrics,
                status: 'processing',
            });
        }
        else {
            agentUsed = 'customer-support';
            agentResponse = await this.customerSupportService.execute({
                sessionId: payload.sessionId,
                customerQuery: payload.query || payload.content || 'General request',
                customerEmail: payload.email,
                customerId: payload.customerId,
                status: 'processing',
            });
        }
        const confidenceScore = agentResponse.metrics?.successRate || 90;
        return {
            coordinatedResponse: agentResponse,
            agentUsed,
            confidenceScore,
        };
    }
    async getCombinedMetrics() {
        const metrics = {
            customerSupport: await this.customerSupportService.getMetrics(),
            salesAssistant: await this.salesAssistantService.getMetrics(),
            marketingAutomation: await this.marketingAutomationService.getMetrics(),
            analyticsReporting: await this.analyticsReportingService.getMetrics(),
        };
        return {
            ...this.metrics,
            ...metrics,
        };
    }
    async getAgentStatuses() {
        return {
            customerSupport: 'active',
            salesAssistant: 'active',
            marketingAutomation: 'active',
            analyticsReporting: 'active',
            coordinator: 'active',
        };
    }
};
exports.AgentSpecializedIntegrationService = AgentSpecializedIntegrationService;
exports.AgentSpecializedIntegrationService = AgentSpecializedIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_customer_support_service_1.AgentCustomerSupportService,
        agent_sales_assistant_service_1.AgentSalesAssistantService,
        agent_marketing_automation_service_1.AgentMarketingAutomationService,
        agent_analytics_reporting_service_1.AgentAnalyticsReportingService,
        redis_service_1.RedisService,
        state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService])
], AgentSpecializedIntegrationService);
//# sourceMappingURL=agent-specialized-integration.service.js.map