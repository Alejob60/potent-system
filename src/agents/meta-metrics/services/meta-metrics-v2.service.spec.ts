import { Test, TestingModule } from '@nestjs/testing';
import { MetaMetricsV2Service } from './meta-metrics-v2.service';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('MetaMetricsV2Service', () => {
  let service: MetaMetricsV2Service;

  const mockRedisService = {};
  const mockStateManager = {};
  const mockWebSocketGateway = {
    broadcastSystemNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetaMetricsV2Service,
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
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<MetaMetricsV2Service>(MetaMetricsV2Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully collect meta metrics', async () => {
      const payload = {
        sessionId: 'test-session-id',
      };

      const result = await service.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.aggregatedMetrics).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const invalidPayload = {
        sessionId: '', // Invalid: empty session ID
      };

      const result = await service.execute(invalidPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const payload = {
        sessionId: 'test-session-id',
      };

      const result = await service.validate(payload);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const payload = {
        sessionId: '', // Invalid: empty session ID
      };

      const result = await service.validate(payload);
      expect(result).toBe(false);
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      const result = await service.getMetrics();
      expect(result).toBeDefined();
    });
  });
});