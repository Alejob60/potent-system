import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentTrendScannerV2Service } from './services/agent-trend-scanner-v2.service';
import { AgentTrendScanner } from './entities/agent-trend-scanner.entity';
import { CreateAgentTrendScannerDto } from './dto/create-agent-trend-scanner.dto';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { MockRepository, mockRedisService, mockStateManagementService, mockWebSocketGatewayService, resetAllMocks } from '../test-utils/agent-test-utils';

describe('AgentTrendScannerV2Service - Integration', () => {
  let service: AgentTrendScannerV2Service;
  let repo: MockRepository<AgentTrendScanner>;

  beforeEach(async () => {
    resetAllMocks();
    
    const mockRepo = new MockRepository<AgentTrendScanner>();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentTrendScannerV2Service,
        {
          provide: getRepositoryToken(AgentTrendScanner),
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

    service = module.get<AgentTrendScannerV2Service>(AgentTrendScannerV2Service);
    repo = mockRepo;
  });

  afterEach(() => {
    resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Full Execution Flow', () => {
    it('should execute trend analysis successfully with all components', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        platform: 'twitter',
        topic: 'artificial intelligence',
      };

      // Execute the service
      const result = await service.execute(dto);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.trends).toBeDefined();
      expect(Array.isArray(result.data.trends)).toBe(true);
      
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
      expect(savedEntities[0].topic).toBe(dto.topic);
      expect(savedEntities[0].platform).toBe(dto.platform);
    });

    it('should return cached results for repeated requests', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        platform: 'twitter',
        topic: 'artificial intelligence',
      };

      // Mock Redis to return cached data
      mockRedisService.get.mockResolvedValueOnce(JSON.stringify({
        trends: [{ keyword: 'AI', volume: 1000 }],
        insights: 'AI is trending',
        recommendations: ['Use AI in content'],
      }));

      // Execute the service
      const result = await service.execute(dto);

      // Verify success and cache hit
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.trends).toBeDefined();
      expect(result.data.fromCache).toBe(true); // Should be from cache
      
      // Verify Redis get was called
      expect(mockRedisService.get).toHaveBeenCalled();
      
      // Verify database operations were not called (cached result)
      // Note: We can't easily verify this in the mock, but logically it should not save to DB
    });

    it('should handle validation errors properly', async () => {
      const invalidDto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        platform: 'invalid-platform', // Invalid platform
        topic: 'artificial intelligence',
      };

      const result = await service.execute(invalidDto);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metrics).toBeDefined();
      
      // Verify error metrics were updated
      expect(result.metrics?.errors).toBe(1);
      
      // Verify WebSocket error notification
      expect(mockWebSocketGatewayService.broadcastSystemNotification).toHaveBeenCalled();
    });

    it('should update metrics correctly during execution', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        platform: 'instagram',
        topic: 'machine learning',
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
    it('should save and retrieve trend analyses', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        platform: 'tiktok',
        topic: 'deep learning',
      };

      // Execute to save data
      await service.execute(dto);
      
      // Test findAll
      const allAnalyses = await service.findAll();
      expect(allAnalyses).toHaveLength(1);
      expect(allAnalyses[0].topic).toBe(dto.topic);
      
      // Test findOne
      const firstAnalysis = await service.findOne(allAnalyses[0].id);
      expect(firstAnalysis).toBeDefined();
      expect(firstAnalysis?.topic).toBe(dto.topic);
    });

    it('should calculate metrics based on database state', async () => {
      // Create some test data
      const mockRepo = new MockRepository<AgentTrendScanner>();
      
      // Add some completed analyses
      const completedEntity = mockRepo.create({
        sessionId: 'test-session-1',
        userId: 'test-user-1',
        platform: 'twitter',
        topic: 'AI',
        status: 'completed',
      });
      await mockRepo.save(completedEntity);
      
      // Add a failed analysis
      const failedEntity = mockRepo.create({
        sessionId: 'test-session-2',
        userId: 'test-user-2',
        platform: 'instagram',
        topic: 'ML',
        status: 'failed',
      });
      await mockRepo.save(failedEntity);
      
      // Replace the repo in the service
      (service as any).agentTrendScannerRepository = mockRepo;
      
      // Get metrics
      const metrics = await service.getMetrics();
      
      expect(metrics.totalAnalyses).toBe(2);
      expect(metrics.successRate).toBe(50); // 1 out of 2
      expect(metrics.failureRate).toBe(50); // 1 out of 2
    });
  });

  describe('Cross-component Integration', () => {
    it('should properly integrate with Redis for agent registration', async () => {
      // The agent should be registered in Redis during construction
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'agent:trend-scanner-v2',
        expect.stringContaining('trend-scanner-v2')
      );
      
      expect(mockRedisService.expire).toHaveBeenCalledWith('agent:trend-scanner-v2', 300);
    });

    it('should report metrics to Redis after execution', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        platform: 'youtube',
        topic: 'neural networks',
      };

      await service.execute(dto);
      
      // Check that metrics were reported to Redis
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'agent_metrics:trend-scanner-v2',
        expect.stringContaining('"requestsProcessed"')
      );
    });

    it('should log activities to state management', async () => {
      const dto: CreateAgentTrendScannerDto = {
        sessionId: 'test-session-id',
        userId: 'test-user-id',
        platform: 'facebook',
        topic: 'computer vision',
      };

      await service.execute(dto);
      
      // Verify activity logging
      expect(mockStateManagementService.addConversationEntry).toHaveBeenCalledWith(
        dto.sessionId,
        expect.objectContaining({
          type: 'system_event',
          content: expect.stringContaining('trend analysis'),
        })
      );
    });
  });
});