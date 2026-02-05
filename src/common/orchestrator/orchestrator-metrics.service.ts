import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

export interface OrchestratorMetrics {
  workflowsExecuted: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  averageExecutionTime: number;
  agentMetrics: Record<string, AgentMetric>;
  lastUpdated: Date;
}

export interface AgentMetric {
  executions: number;
  successRate: number;
  averageResponseTime: number;
  errors: number;
  lastExecution: Date;
}

export interface WorkflowExecutionRecord {
  workflowId: string;
  status: 'success' | 'failure' | 'partial';
  duration: number;
  startTime: Date;
  endTime: Date;
  agentExecutions: AgentExecutionRecord[];
}

export interface AgentExecutionRecord {
  agent: string;
  status: 'success' | 'failure';
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: string;
}

@Injectable()
export class OrchestratorMetricsService {
  private readonly logger = new Logger(OrchestratorMetricsService.name);
  private readonly METRICS_KEY = 'orchestrator:metrics';
  private readonly EXECUTIONS_KEY = 'orchestrator:executions';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Record a workflow execution
   * @param executionRecord Workflow execution record
   */
  async recordWorkflowExecution(executionRecord: WorkflowExecutionRecord): Promise<void> {
    try {
      // Store execution record
      const executionKey = `${this.EXECUTIONS_KEY}:${executionRecord.workflowId}`;
      await this.redisService.set(
        executionKey,
        JSON.stringify(executionRecord),
        86400 // Expire after 24 hours
      );

      // Update metrics
      const currentMetrics = await this.getMetrics();
      
      // Update workflow counts
      currentMetrics.workflowsExecuted++;
      if (executionRecord.status === 'success') {
        currentMetrics.successfulWorkflows++;
      } else {
        currentMetrics.failedWorkflows++;
      }

      // Update average execution time
      const totalExecutions = currentMetrics.workflowsExecuted;
      const currentAverage = currentMetrics.averageExecutionTime;
      currentMetrics.averageExecutionTime = 
        ((currentAverage * (totalExecutions - 1)) + executionRecord.duration) / totalExecutions;

      // Update agent metrics
      for (const agentExecution of executionRecord.agentExecutions) {
        if (!currentMetrics.agentMetrics[agentExecution.agent]) {
          currentMetrics.agentMetrics[agentExecution.agent] = {
            executions: 0,
            successRate: 100,
            averageResponseTime: 0,
            errors: 0,
            lastExecution: new Date(),
          };
        }

        const agentMetric = currentMetrics.agentMetrics[agentExecution.agent];
        agentMetric.executions++;
        agentMetric.lastExecution = new Date();

        if (agentExecution.status === 'success') {
          // Update success rate
          const total = agentMetric.executions;
          const successes = agentMetric.executions - agentMetric.errors;
          agentMetric.successRate = (successes / total) * 100;

          // Update average response time
          const currentAvg = agentMetric.averageResponseTime;
          agentMetric.averageResponseTime = 
            ((currentAvg * (agentMetric.executions - 1)) + agentExecution.duration) / agentMetric.executions;
        } else {
          agentMetric.errors++;
          // Update success rate
          const total = agentMetric.executions;
          const successes = agentMetric.executions - agentMetric.errors;
          agentMetric.successRate = (successes / total) * 100;
        }
      }

      currentMetrics.lastUpdated = new Date();

      // Save updated metrics
      await this.redisService.set(this.METRICS_KEY, JSON.stringify(currentMetrics));

      this.logger.log(`Recorded workflow execution: ${executionRecord.workflowId}`);
    } catch (error) {
      this.logger.error(`Failed to record workflow execution: ${error.message}`);
    }
  }

  /**
   * Get current orchestrator metrics
   * @returns Current metrics
   */
  async getMetrics(): Promise<OrchestratorMetrics> {
    try {
      const metricsData = await this.redisService.get(this.METRICS_KEY);
      
      if (metricsData) {
        return JSON.parse(metricsData);
      }
    } catch (error) {
      this.logger.error(`Failed to get metrics: ${error.message}`);
    }

    // Return default metrics
    return {
      workflowsExecuted: 0,
      successfulWorkflows: 0,
      failedWorkflows: 0,
      averageExecutionTime: 0,
      agentMetrics: {},
      lastUpdated: new Date(),
    };
  }

  /**
   * Get recent workflow executions
   * @param limit Number of executions to return
   * @returns Array of recent workflow executions
   */
  async getRecentExecutions(limit: number = 50): Promise<WorkflowExecutionRecord[]> {
    try {
      // In a real implementation, you would use Redis streams or a more sophisticated
      // approach to store and retrieve execution history
      // For now, we'll return an empty array
      return [];
    } catch (error) {
      this.logger.error(`Failed to get recent executions: ${error.message}`);
      return [];
    }
  }

  /**
   * Reset metrics
   */
  async resetMetrics(): Promise<void> {
    try {
      await this.redisService.del(this.METRICS_KEY);
      this.logger.log('Metrics reset successfully');
    } catch (error) {
      this.logger.error(`Failed to reset metrics: ${error.message}`);
    }
  }

  /**
   * Get execution statistics for a specific agent
   * @param agentName Agent name
   * @returns Agent metrics or null if not found
   */
  async getAgentMetrics(agentName: string): Promise<AgentMetric | null> {
    try {
      const metrics = await this.getMetrics();
      return metrics.agentMetrics[agentName] || null;
    } catch (error) {
      this.logger.error(`Failed to get agent metrics for ${agentName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get execution statistics for a specific workflow
   * @param workflowId Workflow ID
   * @returns Workflow execution record or null if not found
   */
  async getWorkflowExecution(workflowId: string): Promise<WorkflowExecutionRecord | null> {
    try {
      const executionKey = `${this.EXECUTIONS_KEY}:${workflowId}`;
      const executionData = await this.redisService.get(executionKey);
      
      if (executionData) {
        return JSON.parse(executionData);
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to get workflow execution ${workflowId}: ${error.message}`);
      return null;
    }
  }
}