import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentContentEditorV2Service } from './agent-content-editor-v2.service';
import { AgentContentEditor } from '../entities/agent-content-editor.entity';
import { CreateAgentContentEditorDto } from '../dto/create-agent-content-editor.dto';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';

describe('AgentContentEditorV2Service', () => {
  let service: AgentContentEditorV2Service;
  let repo: Repository<AgentContentEditor>;

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
        AgentContentEditorV2Service,
        {
          provide: getRepositoryToken(AgentContentEditor),
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

    service = module.get<AgentContentEditorV2Service>(AgentContentEditorV2Service);
    repo = module.get<Repository<AgentContentEditor>>(getRepositoryToken(AgentContentEditor));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully edit content', async () => {
      const dto: CreateAgentContentEditorDto = {
        sessionId: 'test-session-id',
        content: {
          title: 'Original Title',
          body: 'Original content',
        },
        targetPlatforms: ['facebook', 'twitter'],
      };

      const editResult = {
        editId: 'edit-123',
        editedContent: {
          title: 'Edited Title',
          body: 'Edited content',
          edited: true,
        },
        platformOptimizations: [
          { platform: 'facebook', optimizations: ['Opt 1', 'Opt 2'] },
        ],
        qualityScore: 85,
      };

      const savedEntity = {
        id: 'entity-123',
        ...dto,
        editedContent: editResult.editedContent,
        qualityScore: editResult.qualityScore,
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
      const invalidDto: CreateAgentContentEditorDto = {
        sessionId: '', // Invalid: empty session ID
        content: null, // Invalid: null content
        targetPlatforms: [], // Invalid: empty array
      };

      const result = await service.execute(invalidDto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should return true for valid payload', async () => {
      const dto: CreateAgentContentEditorDto = {
        sessionId: 'test-session-id',
        content: { title: 'Title', body: 'Content' },
        targetPlatforms: ['facebook', 'twitter'],
      };

      const result = await service.validate(dto);
      expect(result).toBe(true);
    });

    it('should return false for invalid payload', async () => {
      const dto: CreateAgentContentEditorDto = {
        sessionId: '', // Invalid: empty session ID
        content: null, // Invalid: null content
        targetPlatforms: [], // Invalid: empty array
      };

      const result = await service.validate(dto);
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all content edits', async () => {
      const mockEdits = [
        { id: '1', content: { title: 'Edit 1' } },
        { id: '2', content: { title: 'Edit 2' } },
      ];
      
      mockRepo.find.mockResolvedValue(mockEdits);

      const result = await service.findAll();
      expect(result).toEqual(mockEdits);
      expect(mockRepo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a content edit by ID', async () => {
      const mockEdit = { id: '1', content: { title: 'Test Edit' } };
      mockRepo.findOneBy.mockResolvedValue(mockEdit);

      const result = await service.findOne('1');
      expect(result).toEqual(mockEdit);
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

      // Mock edits for average quality score calculation
      mockRepo.find.mockResolvedValue([
        { id: '1', qualityScore: 80 },
        { id: '2', qualityScore: 90 },
      ]);

      const result = await service.getMetrics();
      expect(result).toBeDefined();
      expect(result.totalEdits).toBe(10);
      expect(result.successRate).toBe(80);
      expect(result.failureRate).toBe(20);
    });
  });
});