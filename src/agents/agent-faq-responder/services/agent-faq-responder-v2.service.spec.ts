import { Test, TestingModule } from '@nestjs/testing';
import { AgentFaqResponderV2Service } from './agent-faq-responder-v2.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentFaqResponder } from '../entities/agent-faq-responder.entity';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { Repository } from 'typeorm';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';

describe('AgentFaqResponderV2Service', () => {
  let service: AgentFaqResponderV2Service;
  let repo: Repository<AgentFaqResponder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentFaqResponderV2Service,
        {
          provide: getRepositoryToken(AgentFaqResponder),
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

    service = module.get<AgentFaqResponderV2Service>(AgentFaqResponderV2Service);
    repo = module.get<Repository<AgentFaqResponder>>(getRepositoryToken(AgentFaqResponder));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully execute FAQ response generation', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session',
        topic: 'test-topic',
        audience: 'customers',
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
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session',
        topic: 'test-topic',
        audience: 'invalid-audience',
      };

      const result = await service.execute(dto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate correct payload', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session',
        topic: 'test-topic',
        audience: 'customers',
        detailLevel: 'comprehensive',
        format: 'list',
      };

      const isValid = await service.validate(dto);

      expect(isValid).toBe(true);
    });

    it('should reject invalid audience', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session',
        topic: 'test-topic',
        audience: 'invalid-audience',
      };

      const isValid = await service.validate(dto);

      expect(isValid).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const dto = {
        sessionId: 'test-session',
        // missing topic and audience
      } as CreateAgentFaqResponderDto;

      const isValid = await service.validate(dto);

      expect(isValid).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return array of FAQ responses', async () => {
      const mockFaqs = [{ id: '1' }, { id: '2' }];
      (repo.find as jest.Mock).mockResolvedValue(mockFaqs);

      const result = await service.findAll();

      expect(result).toEqual(mockFaqs);
    });
  });

  describe('findOne', () => {
    it('should return a single FAQ response', async () => {
      const mockFaq = { id: 'test-id' };
      (repo.findOneBy as jest.Mock).mockResolvedValue(mockFaq);

      const result = await service.findOne('test-id');

      expect(result).toEqual(mockFaq);
    });

    it('should return null for non-existent FAQ response', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findBySessionId', () => {
    it('should return FAQ responses for a session', async () => {
      const mockFaqs = [{ id: '1', sessionId: 'test-session' }];
      (repo.find as jest.Mock).mockResolvedValue(mockFaqs);

      const result = await service.findBySessionId('test-session');

      expect(result).toEqual(mockFaqs);
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
      expect(result.totalFaqs).toBe(10);
      expect(result.successRate).toBe(80);
      expect(result.failureRate).toBe(20);
    });
  });
});