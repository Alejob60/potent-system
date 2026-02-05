import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentAnalyticsReportingService } from './agent-analytics-reporting.service';
import { AgentAnalyticsReporting } from '../entities/agent-analytics-reporting.entity';
import { CreateAgentAnalyticsReportingDto } from '../dto/create-agent-analytics-reporting.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentAnalyticsReportingService', () => {
  let service: AgentAnalyticsReportingService;
  let repo: Repository<AgentAnalyticsReporting>;

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
        AgentAnalyticsReportingService,
        {
          provide: getRepositoryToken(AgentAnalyticsReporting),
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

    service = module.get<AgentAnalyticsReportingService>(AgentAnalyticsReportingService);
    repo = module.get<Repository<AgentAnalyticsReporting>>(getRepositoryToken(AgentAnalyticsReporting));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should generate an analytics report', async () => {
      const dto: CreateAgentAnalyticsReportingDto = {
        reportType: 'user_engagement',
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
      const dto: CreateAgentAnalyticsReportingDto = {
        reportType: '', // Invalid - empty report type
      };

      const result = await service.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentAnalyticsReportingDto = {
        reportType: 'revenue',
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateAgentAnalyticsReportingDto = {
        reportType: '', // Empty report type
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return an analytics report by ID', async () => {
      const mockRecord = { id: 'test-id', reportType: 'user_engagement' };
      mockRepo.findOneBy.mockResolvedValue(mockRecord);

      const result = await service.findOne('test-id');
      expect(result).toEqual(mockRecord);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 'test-id' });
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      mockRepo.count.mockResolvedValueOnce(12).mockResolvedValueOnce(10).mockResolvedValueOnce(2);

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalReports).toBe(12);
      expect(result.dbSuccessRate).toBe(83.33);
    });
  });
});