import { Module } from '@nestjs/common';
import { AgentCustomerSupportModule } from '../agent-customer-support/agent-customer-support.module';
import { AgentSalesAssistantModule } from '../agent-sales-assistant/agent-sales-assistant.module';
import { AgentMarketingAutomationModule } from '../agent-marketing-automation/agent-marketing-automation.module';
import { AgentAnalyticsReportingModule } from '../agent-analytics-reporting/agent-analytics-reporting.module';
import { AgentSpecializedIntegrationService } from './services/agent-specialized-integration.service';
import { AgentSpecializedIntegrationController } from './controllers/agent-specialized-integration.controller';
import { RedisModule } from '../../common/redis/redis.module';
import { StateModule } from '../../state/state.module';
import { WebSocketModule } from '../../websocket/websocket.module';

@Module({
  imports: [
    AgentCustomerSupportModule,
    AgentSalesAssistantModule,
    AgentMarketingAutomationModule,
    AgentAnalyticsReportingModule,
    RedisModule,
    StateModule,
    WebSocketModule,
  ],
  controllers: [AgentSpecializedIntegrationController],
  providers: [AgentSpecializedIntegrationService],
  exports: [
    AgentCustomerSupportModule,
    AgentSalesAssistantModule,
    AgentMarketingAutomationModule,
    AgentAnalyticsReportingModule,
    AgentSpecializedIntegrationService,
  ],
})
export class AgentSpecializedIntegrationModule {}