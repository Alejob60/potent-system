import { Test, TestingModule } from '@nestjs/testing';
import { OrchestratorMetricsService } from './orchestrator-metrics.service';
import { RedisService } from '../../common/redis/redis.service';

describe('OrchestratorMetricsService', () => {
  let service: OrchestratorMetricsService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrchestratorMetricsService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrchestratorMetricsService>(OrchestratorMetricsService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return default metrics when no data exists', async () => {
      (redisService.get as jest.Mock).mockResolvedValue(null);

      const metrics = await service.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.workflowsExecuted).toBe(0);
      expect(metrics.successfulWorkflows).toBe(0);
      expect(metrics.failedWorkflows).toBe(0);
      expect(metrics.averageExecutionTime).toBe(0);
      expect(metrics.agentMetrics).toEqual({});
      expect(metrics.lastUpdated).toBeDefined();
    });

    it('should return stored metrics when data exists', async () => {
      const storedMetrics = {
        workflowsExecuted: 10,
        successfulWorkflows: 8,
        failedWorkflows: 2,
        averageExecutionTime: 1500,
        agentMetrics: {
          'test-agent': {
            executions: 5,
            successRate: 80,
            averageResponseTime: 1200,
            errors: 1,
            lastExecution: new Date(),
          },
        },
        lastUpdated: new Date(),
      };

      (redisService.get as jest.Mock).mockResolvedValue(JSON.stringify(storedMetrics));

      const metrics = await service.getMetrics();

      expect(metrics).toEqual(storedMetrics);
    });
  });

  describe('getAgentMetrics', () => {
    it('should return null when agent metrics do not exist', async () => {
      (redisService.get as jest.Mock).mockResolvedValue(null);

      const agentMetrics = await service.getAgentMetrics('non-existent-agent');

      expect(agentMetrics).toBeNull();
    });

    it('should return agent metrics when they exist', async () => {
      const agentMetric = {
        executions: 5,
        successRate: 80,
        averageResponseTime: 1200,
        errors: 1,
        lastExecution: new Date(),
      };

      const storedMetrics = {
        workflowsExecuted: 10,
        successfulWorkflows: 8,
        failedWorkflows: 2,
        averageExecutionTime: 1500,
        agentMetrics: {
          'test-agent': agentMetric,
        },
        lastUpdated: new Date(),
      };

      (redisService.get as jest.Mock).mockResolvedValue(JSON.stringify(storedMetrics));

      const agentMetrics = await service.getAgentMetrics('test-agent');

      expect(agentMetrics).toEqual(agentMetric);
    });
  });
});