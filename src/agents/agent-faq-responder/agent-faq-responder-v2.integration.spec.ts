import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentFaqResponderV2Service } from './services/agent-faq-responder-v2.service';
import { AgentFaqResponder } from './entities/agent-faq-responder.entity';
import { CreateAgentFaqResponderDto } from './dto/create-agent-faq-responder.dto';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { MockRepository, mockRedisService, mockStateManagementService, mockWebSocketGatewayService, resetAllMocks } from '../test-utils/agent-test-utils';

describe('AgentFaqResponderV2Service - Integration', () => {
  let service: AgentFaqResponderV2Service;
  let repo: MockRepository<AgentFaqResponder>;

  beforeEach(async () => {
    resetAllMocks();
    
    const mockRepo = new MockRepository<AgentFaqResponder>();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentFaqResponderV2Service,
        {
          provide: getRepositoryToken(AgentFaqResponder),
          useValue: mockRepo,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: StateManagementService,
          useValue: mockStateManagementService,
        },
        {
          provide: WebSocketGatewayService,
          useValue: mockWebSocketGatewayService,
        },
      ],
    }).compile();

    service = module.get<AgentFaqResponderV2Service>(AgentFaqResponderV2Service);
    repo = mockRepo;
  });

  afterEach(() => {
    resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Full Execution Flow', () => {
    it('should execute FAQ response generation successfully with all components', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        question: 'What is artificial intelligence?',
        context: 'AI basics',
      };

      // Execute the service
      const result = await service.execute(dto);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.answer).toBeDefined();
      expect(result.data.confidence).toBeDefined();
      
      // Verify Redis interactions
      expect(mockRedisService.set).toHaveBeenCalled();
      expect(mockRedisService.expire).toHaveBeenCalled();
      
      // Verify WebSocket notifications
      expect(mockWebSocketGatewayService.broadcastSystemNotification).toHaveBeenCalledTimes(2);
      
      // Verify state management
      expect(mockStateManagementService.addConversationEntry).toHaveBeenCalledTimes(2);
      
      // Verify database operations
      const savedEntities = await repo.find();
      expect(savedEntities).toHaveLength(1);
      expect(savedEntities[0].question).toBe(dto.question);
      expect(savedEntities[0].context).toBe(dto.context);
    });

    it('should handle validation errors properly', async () => {
      const invalidDto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        question: '', // Invalid: empty question
        context: 'AI basics',
      };

      const result = await service.execute(invalidDto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metrics).toBeDefined();
      
      // Verify error metrics were updated
      expect(result.metrics.errors).toBe(1);
      
      // Verify WebSocket error notification
      expect(mockWebSocketGatewayService.broadcastSystemNotification).toHaveBeenCalled();
    });

    it('should update metrics correctly during execution', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        question: 'How does machine learning work?',
        context: 'ML fundamentals',
      };

      // Execute multiple times to test metrics accumulation
      const result1 = await service.execute(dto);
      const result2 = await service.execute(dto);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      // Get final metrics
      const metrics = await service.getMetrics();
      
      // Verify metrics are updated
      expect(metrics.requestsProcessed).toBeGreaterThanOrEqual(2);
      expect(metrics.successRate).toBeGreaterThan(90); // Should be high due to successful executions
      expect(metrics.avgResponseTime).toBeGreaterThan(0);
    });
  });

  describe('Database Operations', () => {
    it('should save and retrieve FAQ responses', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        question: 'What are neural networks?',
        context: 'Deep learning',
      };

      // Execute to save data
      await service.execute(dto);
      
      // Test findAll
      const allResponses = await service.findAll();
      expect(allResponses).toHaveLength(1);
      expect(allResponses[0].question).toBe(dto.question);
      
      // Test findOne
      const firstResponse = await service.findOne(allResponses[0].id);
      expect(firstResponse).toBeDefined();
      expect(firstResponse.question).toBe(dto.question);
    });

    it('should calculate metrics based on database state', async () => {
      // Create some test data
      const mockRepo = new MockRepository<AgentFaqResponder>();
      
      // Add some completed responses
      const completedEntity = mockRepo.create({
        sessionId: 'test-session-1',
        userId: 'test-user-1',
        question: 'AI applications',
        context: 'General AI',
        status: 'completed',
      });
      await mockRepo.save(completedEntity);
      
      // Add a failed response
      const failedEntity = mockRepo.create({
        sessionId: 'test-session-2',
        userId: 'test-user-2',
        question: 'ML algorithms',
        context: 'Machine learning',
        status: 'failed',
      });
      await mockRepo.save(failedEntity);
      
      // Replace the repo in the service
      (service as any).agentFaqResponderRepository = mockRepo;
      
      // Get metrics
      const metrics = await service.getMetrics();
      
      expect(metrics.totalResponses).toBe(2);
      expect(metrics.successRate).toBe(50); // 1 out of 2
      expect(metrics.failureRate).toBe(50); // 1 out of 2
    });
  });

  describe('Cross-component Integration', () => {
    it('should properly integrate with Redis for agent registration', async () => {
      // The agent should be registered in Redis during construction
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'agent:faq-responder-v2',
        expect.stringContaining('faq-responder-v2')
      );
      
      expect(mockRedisService.expire).toHaveBeenCalledWith('agent:faq-responder-v2', 300);
    });

    it('should report metrics to Redis after execution', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        question: 'What is computer vision?',
        context: 'AI fields',
      };

      await service.execute(dto);
      
      // Check that metrics were reported to Redis
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'agent_metrics:faq-responder-v2',
        expect.stringContaining('"requestsProcessed"')
      );
    });

    it('should log activities to state management', async () => {
      const dto: CreateAgentFaqResponderDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        question: 'How to implement neural networks?',
        context: 'Practical AI',
      };

      await service.execute(dto);
      
      // Verify activity logging
      expect(mockStateManagementService.addConversationEntry).toHaveBeenCalledWith(
        dto.sessionId,
        expect.objectContaining({
          type: 'system_event',
          content: expect.stringContaining('FAQ response generation'),
        })
      );
    });
  });
});