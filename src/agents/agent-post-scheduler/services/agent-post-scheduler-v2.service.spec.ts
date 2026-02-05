import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentPostSchedulerV2Service } from './agent-post-scheduler-v2.service';
import { AgentPostScheduler } from '../entities/agent-post-scheduler.entity';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentPostSchedulerV2Service', () => {
  let service: AgentPostSchedulerV2Service;
  let repo: Repository<AgentPostScheduler>;

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
        AgentPostSchedulerV2Service,
        {
          provide: getRepositoryToken(AgentPostScheduler),
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

    service = module.get<AgentPostSchedulerV2Service>(AgentPostSchedulerV2Service);
    repo = module.get<Repository<AgentPostScheduler>>(getRepositoryToken(AgentPostScheduler));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully schedule a post', async () => {
      const dto: CreateAgentPostSchedulerDto = {
        content: 'Test post content',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        sessionId: 'test-session-id',
      };

      const scheduledResult = {
        postId: 'post-123',
        scheduledAt: new Date(dto.scheduledAt),
        platform: 'social-media',
        status: 'scheduled',
      };

      const savedEntity = {
        id: 'entity-123',
        ...dto,
        scheduledAt: new Date(dto.scheduledAt),
        published: false,
        status: 'scheduled',
      };

      mockRepo.create.mockReturnValue(savedEntity);
      mockRepo.save.mockResolvedValue(savedEntity);

      const result = await service.execute(dto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidDto: CreateAgentPostSchedulerDto = {
        content: '', // Invalid: empty content
        scheduledAt: new Date(Date.now() - 3600000).toISOString(), // Invalid: past date
        sessionId: 'test-session-id',
      };

      const result = await service.execute(invalidDto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentPostSchedulerDto = {
        content: 'Valid content',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateAgentPostSchedulerDto = {
        content: '', // Invalid: empty content
        scheduledAt: new Date(Date.now() - 3600000).toISOString(), // Invalid: past date
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all scheduled posts', async () => {
      const mockPosts = [
        { id: '1', content: 'Post 1' },
        { id: '2', content: 'Post 2' },
      ];
      
      mockRepo.find.mockResolvedValue(mockPosts);

      const result = await service.findAll();
      expect(result).toEqual(mockPosts);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a scheduled post by ID', async () => {
      const mockPost = { id: '1', content: 'Test Post' };
      mockRepo.findOneBy.mockResolvedValue(mockPost);

      const result = await service.findOne('1');
      expect(result).toEqual(mockPost);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('getMetrics', () => {
    it('should return agent metrics', async () => {
      mockRepo.count.mockImplementation(({ where }) => {
        if (!where) return 10; // total
        if (where.published === false) return 7; // scheduled
        if (where.published === true) return 3; // published
        return 0;
      });

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalPosts).toBe(10);
      expect(result.scheduledPosts).toBe(7);
      expect(result.publishedPosts).toBe(3);
    });
  });
});