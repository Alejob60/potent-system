import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentCreativeSynthesizerV2Service } from './agent-creative-synthesizer-v2.service';
import { AgentCreativeSynthesizer } from '../entities/agent-creative-synthesizer.entity';
import { CreateAgentCreativeSynthesizerDto } from '../dto/create-agent-creative-synthesizer.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentCreativeSynthesizerV2Service', () => {
  let service: AgentCreativeSynthesizerV2Service;
  let repo: Repository<AgentCreativeSynthesizer>;

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
        AgentCreativeSynthesizerV2Service,
        {
          provide: getRepositoryToken(AgentCreativeSynthesizer),
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

    service = module.get<AgentCreativeSynthesizerV2Service>(AgentCreativeSynthesizerV2Service);
    repo = module.get<Repository<AgentCreativeSynthesizer>>(getRepositoryToken(AgentCreativeSynthesizer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully generate creative content', async () => {
      const dto: CreateAgentCreativeSynthesizerDto = {
        sessionId: 'test-session-id',
        intention: 'Create engaging social media content',
        entities: {
          style: 'modern',
          duration: 30,
        },
        format: 'video',
      };

      const synthesisResult = {
        creationId: 'creation-123',
        assets: [
          { id: 'asset-1', type: 'image', url: 'https://example.com/1.jpg' },
          { id: 'asset-2', type: 'video', url: 'https://example.com/2.mp4' },
        ],
        style: 'modern',
        duration: 30,
        format: 'video',
      };

      const savedEntity = {
        id: 'entity-123',
        ...dto,
        assets: synthesisResult.assets,
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

    it('should handle validation errors', async () => {
      const invalidDto: CreateAgentCreativeSynthesizerDto = {
        sessionId: '', // Invalid: empty session ID
        intention: '', // Invalid: empty intention
        entities: null, // Invalid: null entities
      };

      const result = await service.execute(invalidDto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentCreativeSynthesizerDto = {
        sessionId: 'test-session-id',
        intention: 'Create content',
        entities: {
          style: 'modern',
        },
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateAgentCreativeSynthesizerDto = {
        sessionId: '', // Invalid: empty session ID
        intention: '', // Invalid: empty intention
        entities: null, // Invalid: null entities
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all creative creations', async () => {
      const mockCreations = [
        { id: '1', intention: 'Creation 1' },
        { id: '2', intention: 'Creation 2' },
      ];
      
      mockRepo.find.mockResolvedValue(mockCreations);

      const result = await service.findAll();
      expect(result).toEqual(mockCreations);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a creative creation by ID', async () => {
      const mockCreation = { id: '1', intention: 'Test Creation' };
      mockRepo.findOneBy.mockResolvedValue(mockCreation);

      const result = await service.findOne('1');
      expect(result).toEqual(mockCreation);
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
      expect(result.totalCreations).toBe(10);
      expect(result.successRate).toBe(80);
      expect(result.failureRate).toBe(20);
    });
  });
});