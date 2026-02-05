import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentAnalyticsReporterV2Service } from './agent-analytics-reporter-v2.service';
import { AgentAnalyticsReporter } from '../entities/agent-analytics-reporter.entity';
import { CreateAgentAnalyticsReporterDto, AnalyticsPeriod } from '../dto/create-agent-analytics-reporter.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentAnalyticsReporterV2Service', () => {
  let service: AgentAnalyticsReporterV2Service;
  let repo: Repository<AgentAnalyticsReporter>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    count: jest.fn(),
  };

  const mockRedisService = {};
  const mockStateManager = {};
  const mockWebSocketGateway = {
    broadcastSystemNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentAnalyticsReporterV2Service,
        {
          provide: getRepositoryToken(AgentAnalyticsReporter),
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
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<AgentAnalyticsReporterV2Service>(AgentAnalyticsReporterV2Service);
    repo = module.get<Repository<AgentAnalyticsReporter>>(getRepositoryToken(AgentAnalyticsReporter));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully generate an analytics report', async () => {
      const dto: CreateAgentAnalyticsReporterDto = {
        metric: 'engagement',
        period: AnalyticsPeriod.DAILY,
        sessionId: 'test-session-id',
      };

      const reportResult = {
        reportId: 'report-123',
        metric: 'engagement',
        period: AnalyticsPeriod.DAILY,
        stats: [1, 2, 3, 4, 5],
        insights: ['Insight 1', 'Insight 2'],
        recommendations: ['Recommendation 1', 'Recommendation 2'],
      };

      const savedEntity = {
        id: 'entity-123',
        ...dto,
        reportData: {
          metric: reportResult.metric,
          period: reportResult.period,
          stats: reportResult.stats,
          insights: reportResult.insights,
          recommendations: reportResult.recommendations,
        },
        status: 'completed',
      };

      mockRepo.create.mockReturnValue(savedEntity);
      mockRepo.save.mockResolvedValue(savedEntity);

      const result = await service.execute(dto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentAnalyticsReporterDto = {
        metric: 'engagement',
        period: AnalyticsPeriod.DAILY,
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return true for empty payload (all fields optional)', async () => {
      const dto: CreateAgentAnalyticsReporterDto = {};

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all analytics reports', async () => {
      const mockReports = [
        { id: '1', metric: 'engagement' },
        { id: '2', metric: 'reach' },
      ];
      
      mockRepo.find.mockResolvedValue(mockReports);

      const result = await service.findAll();
      expect(result).toEqual(mockReports);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an analytics report by ID', async () => {
      const mockReport = { id: '1', metric: 'Test Report' };
      mockRepo.findOneBy.mockResolvedValue(mockReport);

      const result = await service.findOne('1');
      expect(result).toEqual(mockReport);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      mockRepo.count.mockImplementation(({ where }) => {
        if (!where) return 10; // total
        if (where.status === 'completed') return 8; // completed
        if (where.status === 'failed') return 2; // failed
        return 0;
      });

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalReports).toBe(10);
      expect(result.successRate).toBe(80);
      expect(result.failureRate).toBe(20);
    });
  });
});