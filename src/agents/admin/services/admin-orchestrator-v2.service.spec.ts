import { Test, TestingModule } from '@nestjs/testing';
import { AdminOrchestratorV2Service } from './admin-orchestrator-v2.service';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AdminOrchestratorV2Service', () => {
  let service: AdminOrchestratorV2Service;

  const mockRedisService = {};
  const mockStateManager = {};
  const mockWebSocketGateway = {
    broadcastSystemNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminOrchestratorV2Service,
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

    service = module.get<AdminOrchestratorV2Service>(AdminOrchestratorV2Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully orchestrate agents', async () => {
      const payload = {
        sessionId: 'test-session-id',
        task: 'coordinate-agents',
        agents: ['trend-scanner', 'video-scriptor', 'faq-responder'],
      };

      const result = await service.execute(payload);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.agentsInvolved).toHaveLength(3);
    });

    it('should handle validation errors', async () => {
      const invalidPayload = {
        sessionId: '', // Invalid: empty session ID
        task: '', // Invalid: empty task
        agents: [], // Invalid: empty array
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
        task: 'coordinate-agents',
        agents: ['trend-scanner', 'video-scriptor'],
      };

      const result = await service.validate(payload);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const payload = {
        sessionId: '', // Invalid: empty session ID
        task: '', // Invalid: empty task
        agents: [], // Invalid: empty array
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