import { Test, TestingModule } from '@nestjs/testing';
import { AgentVideoScriptorController } from './agent-video-scriptor.controller';
import { AgentVideoScriptorService } from '../services/agent-video-scriptor.service';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
import { AgentVideoScriptor } from '../entities/agent-video-scriptor.entity';

describe('AgentVideoScriptorController', () => {
  let controller: AgentVideoScriptorController;
  let service: AgentVideoScriptorService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySessionId: jest.fn(),
    getMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentVideoScriptorController],
      providers: [
        {
          provide: AgentVideoScriptorService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AgentVideoScriptorController>(
      AgentVideoScriptorController,
    );
    service = module.get<AgentVideoScriptorService>(AgentVideoScriptorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a video script', async () => {
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

      const result = new AgentVideoScriptor();
      result.id = 'test-id';
      result.sessionId = dto.sessionId;
      result.emotion = dto.emotion;
      result.platform = dto.platform;
      result.format = dto.format;
      result.objective = dto.objective;
      result.script = 'Generated script';

      mockService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all video scripts', async () => {
      const result = [new AgentVideoScriptor(), new AgentVideoScriptor()];

      mockService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a video script by id', async () => {
      const result = new AgentVideoScriptor();
      result.id = 'test-id';

      mockService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('test-id')).toBe(result);
      expect(mockService.findOne).toHaveBeenCalledWith('test-id');
    });
  });

  describe('findBySessionId', () => {
    it('should return video scripts by session id', async () => {
      const result = [new AgentVideoScriptor(), new AgentVideoScriptor()];
      result[0].sessionId = 'test-session';
      result[1].sessionId = 'test-session';

      mockService.findBySessionId.mockResolvedValue(result);

      expect(await controller.findBySessionId('test-session')).toBe(result);
      expect(mockService.findBySessionId).toHaveBeenCalledWith('test-session');
    });
  });

  describe('getMetrics', () => {
    it('should return metrics', async () => {
      const result = {
        totalScripts: 100,
        successRate: 95,
        failureRate: 5,
        averageGenerationTime: 5.2,
      };

      mockService.getMetrics.mockResolvedValue(result);

      expect(await controller.getMetrics()).toBe(result);
      expect(mockService.getMetrics).toHaveBeenCalled();
    });
  });
});
