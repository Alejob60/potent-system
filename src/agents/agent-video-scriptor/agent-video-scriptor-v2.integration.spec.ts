import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentVideoScriptorV2Service } from './services/agent-video-scriptor-v2.service';
import { AgentVideoScriptor } from './entities/agent-video-scriptor.entity';
import { CreateAgentVideoScriptorDto } from './dto/create-agent-video-scriptor.dto';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { MockRepository, mockRedisService, mockStateManagementService, mockWebSocketGatewayService, resetAllMocks } from '../test-utils/agent-test-utils';

describe('AgentVideoScriptorV2Service - Integration', () => {
  let service: AgentVideoScriptorV2Service;
  let repo: MockRepository<AgentVideoScriptor>;

  beforeEach(async () => {
    resetAllMocks();
    
    const mockRepo = new MockRepository<AgentVideoScriptor>();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentVideoScriptorV2Service,
        {
          provide: getRepositoryToken(AgentVideoScriptor),
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

    service = module.get<AgentVideoScriptorV2Service>(AgentVideoScriptorV2Service);
    repo = mockRepo;
  });

  afterEach(() => {
    resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Full Execution Flow', () => {
    it('should execute video script generation successfully with all components', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        concept: 'AI in healthcare',
        targetPlatform: 'youtube',
        videoLength: 300, // 5 minutes
      };

      // Execute the service
      const result = await service.execute(dto);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.script).toBeDefined();
      expect(result.data.scenes).toBeDefined();
      
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
      expect(savedEntities[0].concept).toBe(dto.concept);
      expect(savedEntities[0].targetPlatform).toBe(dto.targetPlatform);
    });

    it('should handle validation errors properly', async () => {
      const invalidDto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        concept: '', // Invalid: empty concept
        targetPlatform: 'youtube',
        videoLength: 300,
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
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        concept: 'Machine learning applications',
        targetPlatform: 'tiktok',
        videoLength: 60, // 1 minute
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
    it('should save and retrieve video scripts', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        concept: 'Deep learning breakthroughs',
        targetPlatform: 'instagram',
        videoLength: 90,
      };

      // Execute to save data
      await service.execute(dto);
      
      // Test findAll
      const allScripts = await service.findAll();
      expect(allScripts).toHaveLength(1);
      expect(allScripts[0].concept).toBe(dto.concept);
      
      // Test findOne
      const firstScript = await service.findOne(allScripts[0].id);
      expect(firstScript).toBeDefined();
      expect(firstScript.concept).toBe(dto.concept);
    });

    it('should calculate metrics based on database state', async () => {
      // Create some test data
      const mockRepo = new MockRepository<AgentVideoScriptor>();
      
      // Add some completed scripts
      const completedEntity = mockRepo.create({
        sessionId: 'test-session-1',
        userId: 'test-user-1',
        concept: 'AI Ethics',
        targetPlatform: 'youtube',
        status: 'completed',
      });
      await mockRepo.save(completedEntity);
      
      // Add a failed script
      const failedEntity = mockRepo.create({
        sessionId: 'test-session-2',
        userId: 'test-user-2',
        concept: 'Neural Networks',
        targetPlatform: 'tiktok',
        status: 'failed',
      });
      await mockRepo.save(failedEntity);
      
      // Replace the repo in the service
      (service as any).agentVideoScriptorRepository = mockRepo;
      
      // Get metrics
      const metrics = await service.getMetrics();
      
      expect(metrics.totalScripts).toBe(2);
      expect(metrics.successRate).toBe(50); // 1 out of 2
      expect(metrics.failureRate).toBe(50); // 1 out of 2
    });
  });

  describe('Cross-component Integration', () => {
    it('should properly integrate with Redis for agent registration', async () => {
      // The agent should be registered in Redis during construction
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'agent:video-scriptor-v2',
        expect.stringContaining('video-scriptor-v2')
      );
      
      expect(mockRedisService.expire).toHaveBeenCalledWith('agent:video-scriptor-v2', 300);
    });

    it('should report metrics to Redis after execution', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        concept: 'Computer vision',
        targetPlatform: 'facebook',
        videoLength: 120,
      };

      await service.execute(dto);
      
      // Check that metrics were reported to Redis
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'agent_metrics:video-scriptor-v2',
        expect.stringContaining('"requestsProcessed"')
      );
    });

    it('should log activities to state management', async () => {
      const dto: CreateAgentVideoScriptorDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        concept: 'Natural language processing',
        targetPlatform: 'twitter',
        videoLength: 45,
      };

      await service.execute(dto);
      
      // Verify activity logging
      expect(mockStateManagementService.addConversationEntry).toHaveBeenCalledWith(
        dto.sessionId,
        expect.objectContaining({
          type: 'system_event',
          content: expect.stringContaining('video script generation'),
        })
      );
    });
  });
});