import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentCustomerSupportService } from '../../agent-customer-support/services/agent-customer-support.service';
import { AgentSalesAssistantService } from '../../agent-sales-assistant/services/agent-sales-assistant.service';
import { AgentMarketingAutomationService } from '../../agent-marketing-automation/services/agent-marketing-automation.service';
import { AgentAnalyticsReportingService } from '../../agent-analytics-reporting/services/agent-analytics-reporting.service';
export declare class AgentSpecializedIntegrationService extends AgentBase {
    private readonly customerSupportService;
    private readonly salesAssistantService;
    private readonly marketingAutomationService;
    private readonly analyticsReportingService;
    constructor(customerSupportService: AgentCustomerSupportService, salesAssistantService: AgentSalesAssistantService, marketingAutomationService: AgentMarketingAutomationService, analyticsReportingService: AgentAnalyticsReportingService, redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: any): Promise<AgentResult>;
    validate(payload: any): Promise<boolean>;
    private coordinateAgents;
    getCombinedMetrics(): Promise<any>;
    getAgentStatuses(): Promise<any>;
}
