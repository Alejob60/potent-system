import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentCustomerSupportService } from './agent-customer-support.service';
import { AgentCustomerSupport } from '../entities/agent-customer-support.entity';
import { CreateAgentCustomerSupportDto } from '../dto/create-agent-customer-support.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentCustomerSupportService', () => {
  let service: AgentCustomerSupportService;
  let repo: Repository<AgentCustomerSupport>;

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

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentCustomerSupportService,
        {
          provide: getRepositoryToken(AgentCustomerSupport),
          useValue: mockRepo,
        },
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
      ],
    }).compile();

    service = module.get<AgentCustomerSupportService>(AgentCustomerSupportService);
    repo = module.get<Repository<AgentCustomerSupport>>(getRepositoryToken(AgentCustomerSupport));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should generate a customer support response', async () => {
      const dto: CreateAgentCustomerSupportDto = {
        customerQuery: 'I need help with my account login',
        sessionId: 'test-session-id',
      };

      const mockResult = {
        response: 'I understand you\'re having an issue with your account.',
        category: 'account',
        priority: 'medium',
        suggestedArticles: ['account-troubleshooting-guide'],
        confidenceScore: 85,
        escalationRequired: false,
      };

      mockRepo.create.mockReturnValue({ id: 'test-id' });
      mockRepo.save.mockResolvedValue({ id: 'test-id' });

      const result = await service.execute(dto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const dto: CreateAgentCustomerSupportDto = {
        customerQuery: '', // Invalid - empty query
      };

      const result = await service.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentCustomerSupportDto = {
        customerQuery: 'I need help with my account',
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateAgentCustomerSupportDto = {
        customerQuery: '', // Empty query
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return a customer support record by ID', async () => {
      const mockRecord = { id: 'test-id', customerQuery: 'Test query' };
      mockRepo.findOneBy.mockResolvedValue(mockRecord);

      const result = await service.findOne('test-id');
      expect(result).toEqual(mockRecord);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'test-id' });
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      mockRepo.count.mockResolvedValueOnce(10).mockResolvedValueOnce(8).mockResolvedValueOnce(2);

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalSupportRequests).toBe(10);
      expect(result.dbSuccessRate).toBe(80);
    });
  });
});