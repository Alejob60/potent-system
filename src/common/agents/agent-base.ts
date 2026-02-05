import { Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';

export interface AgentConfig {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  category?: string;
  priority?: number;
}

export interface AgentMetrics {
  requestsProcessed: number;
  successRate: number;
  avgResponseTime: number;
  errors: number;
  lastActive: Date;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  metrics?: Partial<AgentMetrics>;
}

export abstract class AgentBase {
  protected readonly logger: Logger;
  protected readonly config: AgentConfig;
  protected metrics: AgentMetrics;

  constructor(
    name: string,
    description: string,
    capabilities: string[],
    protected readonly redisService?: RedisService,
    protected readonly stateManager?: StateManagementService,
    protected readonly websocketGateway?: WebSocketGatewayService,
  ) {
    this.logger = new Logger(name);
    this.config = {
      name,
      version: '1.0.0',
      description,
      capabilities,
    };
    
    this.metrics = {
      requestsProcessed: 0,
      successRate: 100,
      avgResponseTime: 0,
      errors: 0,
      lastActive: new Date(),
    };
    
    // Register agent in Redis with a delay to ensure Redis is ready
    setTimeout(() => {
      this.registerAgent();
    }, 1000);
  }

  /**
   * Execute the agent's main functionality
   * @param payload Input data for the agent
   * @returns Agent result with data or error
   */
  abstract execute(payload: any): Promise<AgentResult>;

  /**
   * Validate input payload
   * @param payload Input data to validate
   * @returns Boolean indicating if payload is valid
   */
  abstract validate(payload: any): Promise<boolean>;

  /**
   * Report metrics to the system
   * @returns Current metrics
   */
  async reportMetrics(): Promise<AgentMetrics> {
    return this.metrics;
  }

  /**
   * Update metrics with new values
   * @param updates Partial metrics updates
   */
  protected updateMetrics(updates: Partial<AgentMetrics>): void {
    this.metrics = { ...this.metrics, ...updates, lastActive: new Date() };
    
    // Report metrics to Redis for global monitoring
    this.reportMetricsToRedis();
  }

  /**
   * Handle errors uniformly
   * @param error Error object
   * @param context Context where error occurred
   * @returns Formatted error result
   */
  protected handleError(error: Error, context: string): AgentResult {
    this.logger.error(`[${context}] ${error.message}`, error.stack);
    
    // Update error metrics
    this.updateMetrics({
      errors: this.metrics.errors + 1,
      successRate: Math.max(0, this.metrics.successRate - 1),
    });
    
    // Notify via WebSocket if available
    if (this.websocketGateway) {
      this.websocketGateway.broadcastSystemNotification({
        type: 'agent_error',
        agent: this.config.name,
        error: error.message,
        context,
        timestamp: new Date().toISOString(),
      });
    }
    
    return {
      success: false,
      error: error.message,
      metrics: this.metrics,
    };
  }

  /**
   * Implement standardized retry mechanism
   * @param operation Function to retry
   * @param maxRetries Maximum number of retries
   * @param delay Base delay between retries (ms)
   * @returns Result of operation or error
   */
  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000,
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries) {
          // Exponential backoff with jitter
          const jitter = Math.random() * 0.5 + 0.75; // 0.75-1.25
          const waitTime = Math.min(delay * Math.pow(2, i), 30000) * jitter;
          
          this.logger.warn(
            `Operation failed, retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`,
          );
          
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (lastError) {
      throw lastError;
    }
    
    throw new Error('Retry operation failed without specific error');
  }

  /**
   * Cache data in Redis with expiration
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in seconds
   */
  protected async cacheData(key: string, data: any, ttl = 3600): Promise<void> {
    if (this.redisService) {
      try {
        const cacheKey = `cache:${this.config.name}:${key}`;
        await this.redisService.set(cacheKey, JSON.stringify(data));
        await this.redisService.expire(cacheKey, ttl);
      } catch (error) {
        this.logger.error(`Failed to cache data: ${error.message}`);
      }
    }
  }

  /**
   * Retrieve cached data from Redis
   * @param key Cache key
   * @returns Cached data or null
   */
  protected async getCachedData(key: string): Promise<any> {
    if (this.redisService) {
      try {
        const cacheKey = `cache:${this.config.name}:${key}`;
        const cached = await this.redisService.get(cacheKey);
        return cached ? JSON.parse(cached) : null;
      } catch (error) {
        this.logger.error(`Failed to retrieve cached data: ${error.message}`);
        return null;
      }
    }
    return null;
  }

  /**
   * Batch process multiple operations with concurrency control
   * @param operations Array of operations to process
   * @param concurrency Maximum concurrent operations
   * @returns Results of all operations
   */
  protected async batchProcess<T>(
    operations: Array<() => Promise<T>>,
    concurrency = 5,
  ): Promise<T[]> {
    const results: T[] = [];
    
    // Process in batches
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(op => this.retryWithBackoff(op, 2, 500)),
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Schedule a delayed task
   * @param task Task to execute
   * @param delay Delay in milliseconds
   * @returns Promise that resolves when task completes
   */
  protected async scheduleTask<T>(task: () => Promise<T>, delay: number): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  /**
   * Register agent in Redis for discovery and monitoring
   */
  private async registerAgent(): Promise<void> {
    if (this.redisService) {
      try {
        const agentKey = `agent:${this.config.name}`;
        await this.redisService.set(
          agentKey,
          JSON.stringify({
            ...this.config,
            registeredAt: new Date().toISOString(),
            status: 'active',
          }),
        );
        
        // Set expiration for 5 minutes - agent should refresh registration
        await this.redisService.expire(agentKey, 300);
        
        this.logger.log(`Agent ${this.config.name} registered in Redis`);
      } catch (error) {
        this.logger.error(
          `Failed to register agent ${this.config.name} in Redis: ${error.message}`,
        );
      }
    }
  }

  /**
   * Report metrics to Redis for global monitoring
   */
  private async reportMetricsToRedis(): Promise<void> {
    if (this.redisService) {
      try {
        const metricsKey = `agent_metrics:${this.config.name}`;
        await this.redisService.set(
          metricsKey,
          JSON.stringify(this.metrics),
        );
        
        // Set expiration for 1 hour
        await this.redisService.expire(metricsKey, 3600);
      } catch (error) {
        this.logger.error(
          `Failed to report metrics for agent ${this.config.name} to Redis: ${error.message}`,
        );
      }
    }
  }

  /**
   * Format response in standardized format
   * @param data Response data
   * @returns Standardized agent result
   */
  protected formatResponse(data: any): AgentResult {
    // Update success metrics
    this.updateMetrics({
      requestsProcessed: this.metrics.requestsProcessed + 1,
      successRate: Math.min(100, this.metrics.successRate + 0.1),
    });
    
    return {
      success: true,
      data,
      metrics: this.metrics,
    };
  }

  /**
   * Log agent activity to state management
   * @param sessionId Session ID
   * @param activity Activity description
   * @param data Additional data
   */
  protected logActivity(
    sessionId: string,
    activity: string,
    data?: any,
  ): void {
    if (this.stateManager) {
      this.stateManager.addConversationEntry(sessionId, {
        type: 'system_event',
        content: `[${this.config.name}] ${activity}`,
        metadata: data,
      });
    }
  }
}