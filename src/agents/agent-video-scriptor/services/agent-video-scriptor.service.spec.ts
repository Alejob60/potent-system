import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentVideoScriptorService } from './agent-video-scriptor.service';
import { AgentVideoScriptor } from '../entities/agent-video-scriptor.entity';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';

describe('AgentVideoScriptorService', () => {
  let service: AgentVideoScriptorService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repo: Repository<AgentVideoScriptor>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentVideoScriptorService,
        {
          provide: getRepositoryToken(AgentVideoScriptor),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AgentVideoScriptorService>(AgentVideoScriptorService);
    repo = module.get<Repository<AgentVideoScriptor>>(
      getRepositoryToken(AgentVideoScriptor),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a video script successfully', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session',
        emotion: 'excited',
        platform: 'tiktok',
        format: 'unboxing',
        objective: 'product_launch',
        product: {
          name: 'Test Product',
          features: ['feature1', 'feature2'],
        },
      };

      const entity = new AgentVideoScriptor();
      entity.id = 'test-id';
      entity.sessionId = dto.sessionId;
      entity.emotion = dto.emotion;
      entity.platform = dto.platform;
      entity.format = dto.format;
      entity.objective = dto.objective;
      entity.product = JSON.stringify(dto.product);
      entity.script = expect.any(String);
      entity.narrative = expect.any(String);
      entity.suggestions = expect.any(String);
      entity.status = 'completed';
      entity.visualStyle = expect.any(String);
      entity.compressedScript = expect.any(String);

      mockRepository.create.mockReturnValue(entity);
      mockRepository.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.create(dto);

      expect(result).toEqual(entity);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        product: JSON.stringify(dto.product),
        script: expect.any(String),
        narrative: expect.any(String),
        suggestions: expect.any(String),
        visualStyle: expect.any(String),
        compressedScript: expect.any(String),
        status: 'completed',
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle errors during creation', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session',
        emotion: 'excited',
        platform: 'tiktok',
        format: 'unboxing',
        objective: 'product_launch',
        product: {
          name: 'Test Product',
          features: ['feature1', 'feature2'],
        },
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(dto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all video scripts', async () => {
      const entities = [
        new AgentVideoScriptor(),
        new AgentVideoScriptor(),
      ] as AgentVideoScriptor[];

      mockRepository.find.mockResolvedValue(entities);

      const result = await service.findAll();

      expect(result).toEqual(entities);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a video script by id', async () => {
      const entity = new AgentVideoScriptor();
      entity.id = 'test-id';

      mockRepository.findOneBy.mockResolvedValue(entity);

      const result = await service.findOne('test-id');

      expect(result).toEqual(entity);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should return null if video script not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: 'non-existent-id',
      });
    });
  });

  describe('findBySessionId', () => {
    it('should return video scripts by session id', async () => {
      const entities = [
        new AgentVideoScriptor(),
        new AgentVideoScriptor(),
      ] as AgentVideoScriptor[];
      entities[0].sessionId = 'test-session';
      entities[1].sessionId = 'test-session';

      mockRepository.find.mockResolvedValue(entities);

      const result = await service.findBySessionId('test-session');

      expect(result).toEqual(entities);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { sessionId: 'test-session' },
      });
    });
  });

  describe('getMetrics', () => {
    it('should return metrics', async () => {
      mockRepository.count.mockImplementation((options: any = {}) => {
        const { where } = options;
        if (!where) return 100;
        if (where.status === 'completed') return 95;
        if (where.status === 'failed') return 5;
        return 0;
      });

      const result = await service.getMetrics();

      expect(result).toEqual({
        totalScripts: 100,
        successRate: 95,
        failureRate: 5,
        averageGenerationTime: 5.2,
      });
      expect(mockRepository.count).toHaveBeenCalledTimes(3);
    });

    it('should handle division by zero in metrics', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getMetrics();

      expect(result).toEqual({
        totalScripts: 0,
        successRate: 0,
        failureRate: 0,
        averageGenerationTime: 5.2,
      });
    });
  });

  describe('generateScript', () => {
    it('should generate a script based on parameters', () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session',
        emotion: 'excited',
        platform: 'tiktok',
        format: 'unboxing',
        objective: 'product_launch',
        product: {
          name: 'Test Product',
          features: ['feature1', 'feature2'],
        },
      };

      // @ts-expect-error: private method
      const result = service.generateScript(dto);

      expect(typeof result).toBe('string');
      expect(result).toContain('Test Product');
      expect(result).toContain('feature1');
      expect(result).toContain('feature2');
    });
  });

  describe('suggestVisuals', () => {
    it('should suggest visuals based on parameters', () => {
      // @ts-expect-error: private method
      const result = service.suggestVisuals('tiktok', 'unboxing', 'excited');

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('style');
      expect(result).toHaveProperty('pace');
      expect(result).toHaveProperty('effects');
      expect(result).toHaveProperty('music');
    });
  });

  describe('generateNarrative', () => {
    it('should generate narrative based on parameters', () => {
      // @ts-expect-error: private method
      const result = service.generateNarrative('excited', 'tiktok');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('compressScript', () => {
    it('should compress script based on platform', () => {
      const script = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';

      // @ts-expect-error: private method
      const result = service.compressScript(script, 'tiktok');

      expect(typeof result).toBe('string');
      expect(result.length).toBeLessThanOrEqual(script.length);
    });
  });
});