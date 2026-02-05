import { Test, TestingModule } from '@nestjs/testing';
import { AgentSpecializedIntegrationService } from './agent-specialized-integration.service';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentCustomerSupportService } from '../../agent-customer-support/services/agent-customer-support.service';
import { AgentSalesAssistantService } from '../../agent-sales-assistant/services/agent-sales-assistant.service';
import { AgentMarketingAutomationService } from '../../agent-marketing-automation/services/agent-marketing-automation.service';
import { AgentAnalyticsReportingService } from '../../agent-analytics-reporting/services/agent-analytics-reporting.service';

describe('AgentSpecializedIntegrationService', () => {
  let service: AgentSpecializedIntegrationService;

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    expire: jest.fn(),
  };

  const mockStateManager = {
    addConversationEntry: jest.fn(),
  };

  const mockWebsocketGateway = {
    broadcastSystemNotification: jest.fn(),
  };

  const mockCustomerSupportService = {
    execute: jest.fn(),
  };

  const mockSalesAssistantService = {
    execute: jest.fn(),
  };

  const mockMarketingAutomationService = {
    execute: jest.fn(),
  };

  const mockAnalyticsReportingService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentSpecializedIntegrationService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: StateManagementService,
          useValue: mockStateManager,
        },
        {
          provide: WebSocketGatewayService,
          useValue: mockWebsocketGateway,
        },
        {
          provide: AgentCustomerSupportService,
          useValue: mockCustomerSupportService,
        },
        {
          provide: AgentSalesAssistantService,
          useValue: mockSalesAssistantService,
        },
        {
          provide: AgentMarketingAutomationService,
          useValue: mockMarketingAutomationService,
        },
        {
          provide: AgentAnalyticsReportingService,
          useValue: mockAnalyticsReportingService,
        },
      ],
    }).compile();

    service = module.get<AgentSpecializedIntegrationService>(AgentSpecializedIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should coordinate with customer support agent for support requests', async () => {
      const payload = {
        requestType: 'support',
        query: 'I need help with my account',
        sessionId: 'test-session-id',
      };

      const mockResponse = {
        success: true,
        data: { response: 'Support response' },
        metrics: { successRate: 95 },
      };

      mockCustomerSupportService.execute.mockResolvedValue(mockResponse);

      const result = await service.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockCustomerSupportService.execute).toHaveBeenCalled();
    });

    it('should coordinate with sales assistant agent for sales requests', async () => {
      const payload = {
        requestType: 'sales',
        query: 'I want to learn about your enterprise solution',
        sessionId: 'test-session-id',
      };

      const mockResponse = {
        success: true,
        data: { qualification: 'Qualified lead' },
        metrics: { successRate: 90 },
      };

      mockSalesAssistantService.execute.mockResolvedValue(mockResponse);

      const result = await service.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSalesAssistantService.execute).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const payload = {
        requestType: '', // Invalid - empty request type
      };

      const result = await service.execute(payload);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const payload = {
        requestType: 'support',
      };

      const result = await service.validate(payload);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const payload = {
        requestType: '', // Empty request type
      };

      const result = await service.validate(payload);
      expect(result).toBe(false);
    });
  });

  describe('getCombinedMetrics', () => {
    it('should return combined metrics from all agents', async () => {
      const mockMetrics = { totalRequests: 100, successRate: 95 };
      mockCustomerSupportService.getMetrics = jest.fn().mockResolvedValue(mockMetrics);
      mockSalesAssistantService.getMetrics = jest.fn().mockResolvedValue(mockMetrics);
      mockMarketingAutomationService.getMetrics = jest.fn().mockResolvedValue(mockMetrics);
      mockAnalyticsReportingService.getMetrics = jest.fn().mockResolvedValue(mockMetrics);

      const result = await service.getCombinedMetrics();
      expect(result).toBeDefined();
      expect(result.customerSupport).toEqual(mockMetrics);
      expect(result.salesAssistant).toEqual(mockMetrics);
      expect(result.marketingAutomation).toEqual(mockMetrics);
      expect(result.analyticsReporting).toEqual(mockMetrics);
    });
  });
});