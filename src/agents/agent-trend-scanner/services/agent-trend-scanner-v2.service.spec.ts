import { Test, TestingModule } from '@nestjs/testing';
import { AgentTrendScannerV2Service } from './agent-trend-scanner-v2.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentTrendScanner } from '../entities/agent-trend-scanner.entity';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { Repository } from 'typeorm';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';

describe('AgentTrendScannerV2Service', () => {
  let service: AgentTrendScannerV2Service;
  let repo: Repository<AgentTrendScanner>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentTrendScannerV2Service,
        {
          provide: getRepositoryToken(AgentTrendScanner),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            expire: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: StateManagementService,
          useValue: {
            addConversationEntry: jest.fn(),
            getSession: jest.fn(),
          },
        },
        {
          provide: WebSocketGatewayService,
          useValue: {
            broadcastSystemNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgentTrendScannerV2Service>(AgentTrendScannerV2Service);
    repo = module.get<Repository<AgentTrendScanner>>(getRepositoryToken(AgentTrendScanner));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully execute trend analysis', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session',
        platform: 'tiktok',
        topic: 'test-topic',
      };

      // Mock repository methods
      (repo.create as jest.Mock).mockReturnValue({ id: 'test-id' });
      (repo.save as jest.Mock).mockResolvedValue({ id: 'test-id' });

      const result = await service.execute(dto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session',
        platform: 'invalid-platform',
        topic: 'test-topic',
      };

      const result = await service.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate correct payload', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session',
        platform: 'tiktok',
        topic: 'test-topic',
      };

      const isValid = await service.validate(dto);

      expect(isValid).toBe(true);
    });

    it('should reject invalid platform', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session',
        platform: 'invalid-platform',
        topic: 'test-topic',
      };

      const isValid = await service.validate(dto);

      expect(isValid).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const dto = {
        sessionId: 'test-session',
        // missing platform and topic
      } as CreateAgentTrendScannerDto;

      const isValid = await service.validate(dto);

      expect(isValid).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return array of trend analyses', async () => {
      const mockTrends = [{ id: '1' }, { id: '2' }];
      (repo.find as jest.Mock).mockResolvedValue(mockTrends);

      const result = await service.findAll();

      expect(result).toEqual(mockTrends);
    });
  });

  describe('findOne', () => {
    it('should return a single trend analysis', async () => {
      const mockTrend = { id: 'test-id' };
      (repo.findOneBy as jest.Mock).mockResolvedValue(mockTrend);

      const result = await service.findOne('test-id');

      expect(result).toEqual(mockTrend);
    });

    it('should return null for non-existent trend analysis', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      (repo.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8)  // completed
        .mockResolvedValueOnce(2); // failed

      const result = await service.getMetrics();

      expect(result).toBeDefined();
      expect(result.totalAnalyses).toBe(10);
      expect(result.successRate).toBe(80);
      expect(result.failureRate).toBe(20);
    });
  });
});