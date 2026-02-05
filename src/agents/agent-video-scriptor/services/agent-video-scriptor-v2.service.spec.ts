import { Test, TestingModule } from '@nestjs/testing';
import { AgentVideoScriptorV2Service } from './agent-video-scriptor-v2.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentVideoScriptor } from '../entities/agent-video-scriptor.entity';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { Repository } from 'typeorm';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';

describe('AgentVideoScriptorV2Service', () => {
  let service: AgentVideoScriptorV2Service;
  let repo: Repository<AgentVideoScriptor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentVideoScriptorV2Service,
        {
          provide: getRepositoryToken(AgentVideoScriptor),
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

    service = module.get<AgentVideoScriptorV2Service>(AgentVideoScriptorV2Service);
    repo = module.get<Repository<AgentVideoScriptor>>(getRepositoryToken(AgentVideoScriptor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully execute script generation', async () => {
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

      // Mock repository methods
      (repo.create as jest.Mock).mockReturnValue({ id: 'test-id' });
      (repo.save as jest.Mock).mockResolvedValue({ id: 'test-id' });

      const result = await service.execute(dto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should handle validation errors', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session',
        emotion: 'invalid-emotion',
        platform: 'tiktok',
        format: 'unboxing',
        product: {
          name: 'Test Product',
          features: ['feature1', 'feature2'],
        },
      };

      const result = await service.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate correct payload', async () => {
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

      const isValid = await service.validate(dto);

      expect(isValid).toBe(true);
    });

    it('should reject invalid emotion', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session',
        emotion: 'invalid-emotion',
        platform: 'tiktok',
        format: 'unboxing',
        product: {
          name: 'Test Product',
          features: ['feature1', 'feature2'],
        },
      };

      const isValid = await service.validate(dto);

      expect(isValid).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const dto = {
        sessionId: 'test-session',
        // missing emotion, platform, format, product
      } as CreateAgentVideoScriptorDto;

      const isValid = await service.validate(dto);

      expect(isValid).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return array of script creations', async () => {
      const mockScripts = [{ id: '1' }, { id: '2' }];
      (repo.find as jest.Mock).mockResolvedValue(mockScripts);

      const result = await service.findAll();

      expect(result).toEqual(mockScripts);
    });
  });

  describe('findOne', () => {
    it('should return a single script creation', async () => {
      const mockScript = { id: 'test-id' };
      (repo.findOneBy as jest.Mock).mockResolvedValue(mockScript);

      const result = await service.findOne('test-id');

      expect(result).toEqual(mockScript);
    });

    it('should return null for non-existent script creation', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findBySessionId', () => {
    it('should return script creations for a session', async () => {
      const mockScripts = [{ id: '1', sessionId: 'test-session' }];
      (repo.find as jest.Mock).mockResolvedValue(mockScripts);

      const result = await service.findBySessionId('test-session');

      expect(result).toEqual(mockScripts);
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
      expect(result.totalScripts).toBe(10);
      expect(result.successRate).toBe(80);
      expect(result.failureRate).toBe(20);
    });
  });
});