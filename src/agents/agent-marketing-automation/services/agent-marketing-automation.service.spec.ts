import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentMarketingAutomationService } from './agent-marketing-automation.service';
import { AgentMarketingAutomation } from '../entities/agent-marketing-automation.entity';
import { CreateAgentMarketingAutomationDto } from '../dto/create-agent-marketing-automation.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentMarketingAutomationService', () => {
  let service: AgentMarketingAutomationService;
  let repo: Repository<AgentMarketingAutomation>;

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
        AgentMarketingAutomationService,
        {
          provide: getRepositoryToken(AgentMarketingAutomation),
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

    service = module.get<AgentMarketingAutomationService>(AgentMarketingAutomationService);
    repo = module.get<Repository<AgentMarketingAutomation>>(getRepositoryToken(AgentMarketingAutomation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should design a marketing campaign', async () => {
      const dto: CreateAgentMarketingAutomationDto = {
        campaignObjective: 'Increase brand awareness for our new product launch',
        sessionId: 'test-session-id',
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
      const dto: CreateAgentMarketingAutomationDto = {
        campaignObjective: '', // Invalid - empty objective
      };

      const result = await service.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentMarketingAutomationDto = {
        campaignObjective: 'Brand awareness campaign',
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateAgentMarketingAutomationDto = {
        campaignObjective: '', // Empty objective
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return a marketing campaign record by ID', async () => {
      const mockRecord = { id: 'test-id', campaignObjective: 'Test campaign' };
      mockRepo.findOneBy.mockResolvedValue(mockRecord);

      const result = await service.findOne('test-id');
      expect(result).toEqual(mockRecord);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'test-id' });
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      mockRepo.count.mockResolvedValueOnce(8).mockResolvedValueOnce(7).mockResolvedValueOnce(1);

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalCampaigns).toBe(8);
      expect(result.dbSuccessRate).toBe(87.5);
    });
  });
});