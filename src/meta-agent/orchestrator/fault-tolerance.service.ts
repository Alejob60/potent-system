import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  timeout: number; // Timeout in milliseconds before allowing retry
  resetTimeout: number; // Time in milliseconds to try closing circuit
}

export interface CircuitBreakerState {
  id: string;
  status: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure: Date | null;
  nextAttempt: Date | null;
  config: CircuitBreakerConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  delay: number; // Initial delay in milliseconds
  backoffMultiplier: number; // Multiplier for exponential backoff
  maxDelay: number; // Maximum delay in milliseconds
}

@Injectable()
export class FaultToleranceService {
  private readonly logger = new Logger(FaultToleranceService.name);
  private readonly CIRCUIT_BREAKER_PREFIX = 'circuit_breaker';
  private readonly RETRY_POLICY_PREFIX = 'retry_policy';
  private readonly FAILURE_LOG_PREFIX = 'failure_log';

  constructor(
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly stateManager: StateManagementService,
  ) {}

  /**
   * Create a circuit breaker
   * @param id Circuit breaker ID
   * @param config Configuration
   * @returns Promise resolving to boolean indicating success
   */
  async createCircuitBreaker(id: string, config: CircuitBreakerConfig): Promise<boolean> {
    try {
      const state: CircuitBreakerState = {
        id,
        status: 'closed',
        failureCount: 0,
        lastFailure: null,
        nextAttempt: null,
        config
      };

      const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
      await this.redisService.set(key, JSON.stringify(state));
      
      this.logger.log(`Created circuit breaker ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating circuit breaker ${id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if circuit breaker allows execution
   * @param id Circuit breaker ID
   * @returns Promise resolving to boolean indicating if execution is allowed
   */
  async canExecute(id: string): Promise<boolean> {
    try {
      const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
      const stateJson = await this.redisService.get(key);
      
      if (!stateJson) {
        // If no circuit breaker exists, allow execution
        return true;
      }

      const state: CircuitBreakerState = JSON.parse(stateJson);
      
      // Convert date strings back to Date objects
      if (state.lastFailure) {
        state.lastFailure = new Date(state.lastFailure);
      }
      if (state.nextAttempt) {
        state.nextAttempt = new Date(state.nextAttempt);
      }

      switch (state.status) {
        case 'closed':
          // Circuit is closed, allow execution
          return true;
          
        case 'open':
          // Circuit is open, check if timeout has expired
          const now = new Date();
          if (state.nextAttempt && now >= state.nextAttempt) {
            // Move to half-open state to test
            state.status = 'half-open';
            state.nextAttempt = null;
            await this.redisService.set(key, JSON.stringify(state));
            return true;
          }
          // Still open, deny execution
          return false;
          
        case 'half-open':
          // Allow one execution to test
          return true;
          
        default:
          return true;
      }
    } catch (error) {
      this.logger.error(`Error checking circuit breaker ${id}: ${error.message}`);
      // On error, allow execution as fallback
      return true;
    }
  }

  /**
   * Report successful execution
   * @param id Circuit breaker ID
   * @returns Promise resolving to boolean indicating success
   */
  async reportSuccess(id: string): Promise<boolean> {
    try {
      const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
      const stateJson = await this.redisService.get(key);
      
      if (!stateJson) {
        return true;
      }

      const state: CircuitBreakerState = JSON.parse(stateJson);
      
      // Reset failure count and close circuit
      state.failureCount = 0;
      state.lastFailure = null;
      state.nextAttempt = null;
      state.status = 'closed';
      
      await this.redisService.set(key, JSON.stringify(state));
      
      // Broadcast success notification
      this.websocketGateway.broadcastSystemNotification({
        type: 'circuit_breaker_reset',
        circuitBreakerId: id,
        status: 'closed',
        timestamp: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error reporting success for circuit breaker ${id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Report failed execution
   * @param id Circuit breaker ID
   * @param error Error information
   * @returns Promise resolving to boolean indicating success
   */
  async reportFailure(id: string, error: any): Promise<boolean> {
    try {
      const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
      const stateJson = await this.redisService.get(key);
      
      if (!stateJson) {
        return true;
      }

      const state: CircuitBreakerState = JSON.parse(stateJson);
      
      // Convert date strings back to Date objects
      if (state.lastFailure) {
        state.lastFailure = new Date(state.lastFailure);
      }
      if (state.nextAttempt) {
        state.nextAttempt = new Date(state.nextAttempt);
      }

      // Increment failure count
      state.failureCount += 1;
      state.lastFailure = new Date();
      
      // Check if threshold is reached
      if (state.failureCount >= state.config.failureThreshold) {
        // Open circuit
        state.status = 'open';
        const nextAttempt = new Date();
        nextAttempt.setTime(nextAttempt.getTime() + state.config.timeout);
        state.nextAttempt = nextAttempt;
        
        // Log failure
        await this.logFailure(id, error);
        
        // Broadcast failure notification
        this.websocketGateway.broadcastSystemNotification({
          type: 'circuit_breaker_opened',
          circuitBreakerId: id,
          status: 'open',
          failureCount: state.failureCount,
          timestamp: new Date().toISOString(),
        });
      }
      
      await this.redisService.set(key, JSON.stringify(state));
      return true;
    } catch (e) {
      this.logger.error(`Error reporting failure for circuit breaker ${id}: ${e.message}`);
      return false;
    }
  }

  /**
   * Log failure for analysis
   * @param id Circuit breaker ID
   * @param error Error information
   * @returns Promise resolving to boolean indicating success
   */
  private async logFailure(id: string, error: any): Promise<boolean> {
    try {
      const logEntry = {
        id,
        timestamp: new Date(),
        error: JSON.stringify(error)
      };
      
      const key = `${this.FAILURE_LOG_PREFIX}:${id}`;
      const logsJson = await this.redisService.lrange(key, 0, 99); // Get last 100 entries
      const logs = logsJson.map(log => JSON.parse(log));
      logs.push(logEntry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      // Save logs
      await this.redisService.del(key);
      for (const log of logs) {
        await this.redisService.rpush(key, JSON.stringify(log));
      }
      
      return true;
    } catch (e) {
      this.logger.error(`Error logging failure for circuit breaker ${id}: ${e.message}`);
      return false;
    }
  }

  /**
   * Get circuit breaker state
   * @param id Circuit breaker ID
   * @returns Promise resolving to circuit breaker state or null
   */
  async getCircuitBreakerState(id: string): Promise<CircuitBreakerState | null> {
    try {
      const key = `${this.CIRCUIT_BREAKER_PREFIX}:${id}`;
      const stateJson = await this.redisService.get(key);
      
      if (!stateJson) {
        return null;
      }

      const state: CircuitBreakerState = JSON.parse(stateJson);
      
      // Convert date strings back to Date objects
      if (state.lastFailure) {
        state.lastFailure = new Date(state.lastFailure);
      }
      if (state.nextAttempt) {
        state.nextAttempt = new Date(state.nextAttempt);
      }
      
      return state;
    } catch (error) {
      this.logger.error(`Error retrieving circuit breaker state for ${id}: ${error.message}`);
      return null;
    }
  }

  /**
   * Execute function with retry policy
   * @param id Retry policy ID
   * @param fn Function to execute
   * @param policy Retry policy
   * @returns Promise resolving to function result
   */
  async executeWithRetry<T>(
    id: string,
    fn: () => Promise<T>,
    policy: RetryPolicy = {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      maxDelay: 30000
    }
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      try {
        // Check circuit breaker
        const canExecute = await this.canExecute(id);
        if (!canExecute) {
          throw new Error(`Circuit breaker ${id} is open`);
        }
        
        const result = await fn();
        
        // Report success
        await this.reportSuccess(id);
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Report failure
        await this.reportFailure(id, {
          message: error.message,
          stack: error.stack,
          attempt
        });
        
        // If this was the last attempt, throw the error
        if (attempt === policy.maxAttempts) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          policy.delay * Math.pow(policy.backoffMultiplier, attempt - 1),
          policy.maxDelay
        );
        
        this.logger.warn(`Attempt ${attempt} failed for ${id}, retrying in ${delay}ms: ${error.message}`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error(`Failed after ${policy.maxAttempts} attempts`);
  }

  /**
   * Create retry policy
   * @param id Retry policy ID
   * @param policy Retry policy configuration
   * @returns Promise resolving to boolean indicating success
   */
  async createRetryPolicy(id: string, policy: RetryPolicy): Promise<boolean> {
    try {
      const key = `${this.RETRY_POLICY_PREFIX}:${id}`;
      await this.redisService.set(key, JSON.stringify(policy));
      
      this.logger.log(`Created retry policy ${id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating retry policy ${id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get retry policy
   * @param id Retry policy ID
   * @returns Promise resolving to retry policy or null
   */
  async getRetryPolicy(id: string): Promise<RetryPolicy | null> {
    try {
      const key = `${this.RETRY_POLICY_PREFIX}:${id}`;
      const policyJson = await this.redisService.get(key);
      
      if (!policyJson) {
        return null;
      }

      return JSON.parse(policyJson);
    } catch (error) {
      this.logger.error(`Error retrieving retry policy ${id}: ${error.message}`);
      return null;
    }
  }
}