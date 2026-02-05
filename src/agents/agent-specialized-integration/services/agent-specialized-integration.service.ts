import { Injectable } from '@nestjs/common';
import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentCustomerSupportService } from '../../agent-customer-support/services/agent-customer-support.service';
import { AgentSalesAssistantService } from '../../agent-sales-assistant/services/agent-sales-assistant.service';
import { AgentMarketingAutomationService } from '../../agent-marketing-automation/services/agent-marketing-automation.service';
import { AgentAnalyticsReportingService } from '../../agent-analytics-reporting/services/agent-analytics-reporting.service';

interface SpecializedAgentCoordinationResult {
  coordinatedResponse: any;
  agentUsed: string;
  confidenceScore: number;
}

@Injectable()
export class AgentSpecializedIntegrationService extends AgentBase {
  constructor(
    private readonly customerSupportService: AgentCustomerSupportService,
    private readonly salesAssistantService: AgentSalesAssistantService,
    private readonly marketingAutomationService: AgentMarketingAutomationService,
    private readonly analyticsReportingService: AgentAnalyticsReportingService,
    redisService: RedisService,
    stateManager: StateManagementService,
    websocketGateway: WebSocketGatewayService,
  ) {
    super(
      'specialized-integration',
      'Coordinate specialized agents based on request type',
      ['agent_coordination', 'request_routing', 'response_integration'],
      redisService,
      stateManager,
      websocketGateway,
    );
  }

  /**
   * Execute specialized agent coordination
   * @param payload Coordination parameters
   * @returns Coordinated response from appropriate agent
   */
  async execute(payload: any): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!(await this.validate(payload))) {
        return this.handleError(
          new Error('Invalid payload'),
          'execute.validate',
        );
      }
      
      // Log activity
      this.logActivity(
        payload.sessionId || 'unknown',
        'Starting specialized agent coordination',
        payload,
      );
      
      // Notify via WebSocket
      if (this.websocketGateway) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'agent_processing',
          agent: this.config.name,
          sessionId: payload.sessionId || 'unknown',
          message: 'Coordinating specialized agents',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Coordinate with appropriate specialized agent
      const result = await this.coordinateAgents(payload);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Update metrics
      this.updateMetrics({
        avgResponseTime: processingTime,
      });
      
      // Log completion
      this.logActivity(
        payload.sessionId || 'unknown',
        'Specialized agent coordination completed',
        { processingTime, agentUsed: result.agentUsed },
      );
      
      return this.formatResponse({
        coordinatedResponse: result.coordinatedResponse,
        agentUsed: result.agentUsed,
        confidenceScore: result.confidenceScore,
      });
    } catch (error) {
      return this.handleError(error, 'execute');
    }
  }

  /**
   * Validate coordination payload
   * @param payload Payload to validate
   * @returns Boolean indicating if payload is valid
   */
  async validate(payload: any): Promise<boolean> {
    if (!payload) return false;
    if (!payload.requestType) return false;
    return true;
  }

  /**
   * Coordinate with appropriate specialized agent
   * @param payload Coordination parameters
   * @returns Coordinated response
   */
  private async coordinateAgents(payload: any): Promise<SpecializedAgentCoordinationResult> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Determine which agent to use based on request type
    const requestType = payload.requestType.toLowerCase();
    
    let agentResponse: AgentResult;
    let agentUsed: string;
    
    if (requestType.includes('support') || requestType.includes('help') || requestType.includes('issue')) {
      // Use customer support agent
      agentUsed = 'customer-support';
      agentResponse = await this.customerSupportService.execute({
        sessionId: payload.sessionId,
        customerQuery: payload.query || payload.content || 'General support request',
        customerEmail: payload.email,
        customerId: payload.customerId,
        status: 'processing',
      });
    } else if (requestType.includes('sales') || requestType.includes('lead') || requestType.includes('demo')) {
      // Use sales assistant agent
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
    } else if (requestType.includes('marketing') || requestType.includes('campaign') || requestType.includes('promotion')) {
      // Use marketing automation agent
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
    } else if (requestType.includes('analytics') || requestType.includes('report') || requestType.includes('insight')) {
      // Use analytics reporting agent
      agentUsed = 'analytics-reporting';
      agentResponse = await this.analyticsReportingService.execute({
        sessionId: payload.sessionId,
        reportType: payload.query || payload.content || 'General analytics request',
        dateRange: payload.dateRange,
        metrics: payload.metrics,
        status: 'processing',
      });
    } else {
      // Default to customer support agent for general requests
      agentUsed = 'customer-support';
      agentResponse = await this.customerSupportService.execute({
        sessionId: payload.sessionId,
        customerQuery: payload.query || payload.content || 'General request',
        customerEmail: payload.email,
        customerId: payload.customerId,
        status: 'processing',
      });
    }
    
    // Calculate confidence score
    const confidenceScore = agentResponse.metrics?.successRate || 90;
    
    return {
      coordinatedResponse: agentResponse,
      agentUsed,
      confidenceScore,
    };
  }

  /**
   * Get metrics from all specialized agents
   * @returns Combined metrics
   */
  async getCombinedMetrics(): Promise<any> {
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

  /**
   * Get status of all specialized agents
   * @returns Agent statuses
   */
  async getAgentStatuses(): Promise<any> {
    return {
      customerSupport: 'active',
      salesAssistant: 'active',
      marketingAutomation: 'active',
      analyticsReporting: 'active',
      coordinator: 'active',
    };
  }
}