import { Test, TestingModule } from '@nestjs/testing';
import { ChatV2Service } from './chat-v2.service';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('ChatV2Service', () => {
  let service: ChatV2Service;

  const mockRedisService = {};
  const mockStateManager = {};
  const mockWebSocketGateway = {
    broadcastSystemNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatV2Service,
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

    service = module.get<ChatV2Service>(ChatV2Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully generate a chat response', async () => {
      const payload = {
        sessionId: 'test-session-id',
        message: 'Hello, how can you help me?',
      };

      const result = await service.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.response).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const invalidPayload = {
        sessionId: '', // Invalid: empty session ID
        message: '', // Invalid: empty message
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
        message: 'Valid message',
      };

      const result = await service.validate(payload);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const payload = {
        sessionId: '', // Invalid: empty session ID
        message: '', // Invalid: empty message
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