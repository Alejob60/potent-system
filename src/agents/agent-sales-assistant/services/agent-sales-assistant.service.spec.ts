import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentSalesAssistantService } from './agent-sales-assistant.service';
import { AgentSalesAssistant } from '../entities/agent-sales-assistant.entity';
import { CreateAgentSalesAssistantDto } from '../dto/create-agent-sales-assistant.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentSalesAssistantService', () => {
  let service: AgentSalesAssistantService;
  let repo: Repository<AgentSalesAssistant>;

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
        AgentSalesAssistantService,
        {
          provide: getRepositoryToken(AgentSalesAssistant),
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

    service = module.get<AgentSalesAssistantService>(AgentSalesAssistantService);
    repo = module.get<Repository<AgentSalesAssistant>>(getRepositoryToken(AgentSalesAssistant));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should qualify a sales lead', async () => {
      const dto: CreateAgentSalesAssistantDto = {
        leadInformation: 'Looking for enterprise software solution for 500+ employees in the technology sector',
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
      const dto: CreateAgentSalesAssistantDto = {
        leadInformation: '', // Invalid - empty information
      };

      const result = await service.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentSalesAssistantDto = {
        leadInformation: 'Enterprise software inquiry',
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateAgentSalesAssistantDto = {
        leadInformation: '', // Empty information
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return a sales qualification record by ID', async () => {
      const mockRecord = { id: 'test-id', leadInformation: 'Test lead info' };
      mockRepo.findOneBy.mockResolvedValue(mockRecord);

      const result = await service.findOne('test-id');
      expect(result).toEqual(mockRecord);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'test-id' });
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      mockRepo.count.mockResolvedValueOnce(15).mockResolvedValueOnce(12).mockResolvedValueOnce(3);

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalQualifications).toBe(15);
      expect(result.dbSuccessRate).toBe(80);
    });
  });
});