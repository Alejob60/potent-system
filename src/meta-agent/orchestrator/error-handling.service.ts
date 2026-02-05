import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';

export interface ErrorInfo {
  id: string;
  type: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  sessionId?: string;
  workflowId?: string;
  executionId?: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
  metadata?: Record<string, any>;
}

export interface ErrorHandlingPolicy {
  component: string;
  errorType: string;
  action: 'retry' | 'failover' | 'ignore' | 'notify' | 'escalate';
  maxRetries?: number;
  retryDelay?: number;
  failoverTarget?: string;
  notificationChannels?: string[];
  escalationLevel?: 'level1' | 'level2' | 'level3';
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  steps: string[];
  successCriteria: string;
  estimatedDuration: number; // in minutes
  requiredResources: string[];
}

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);
  private readonly ERROR_PREFIX = 'error';
  private readonly ERROR_POLICY_PREFIX = 'error_policy';
  private readonly RECOVERY_STRATEGY_PREFIX = 'recovery_strategy';
  private readonly ERROR_STATS_PREFIX = 'error_stats';

  constructor(
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly stateManager: StateManagementService,
  ) {}

  /**
   * Record an error
   * @param errorInfo Error information
   * @returns Promise resolving to boolean indicating success
   */
  async recordError(errorInfo: Omit<ErrorInfo, 'id' | 'timestamp' | 'resolved'>): Promise<boolean> {
    try {
      const fullErrorInfo: ErrorInfo = {
        id: this.generateErrorId(),
        timestamp: new Date(),
        resolved: false,
        ...errorInfo
      };

      const key = `${this.ERROR_PREFIX}:${fullErrorInfo.id}`;
      await this.redisService.setex(key, 2592000, JSON.stringify(fullErrorInfo)); // Store for 30 days
      
      // Update error statistics
      await this.updateErrorStats(fullErrorInfo);
      
      // Notify relevant parties based on severity
      await this.notifyOnError(fullErrorInfo);
      
      // Update session state if applicable
      if (fullErrorInfo.sessionId) {
        await this.stateManager.addConversationEntry(fullErrorInfo.sessionId, {
          type: 'system_event',
          content: fullErrorInfo.message,
          metadata: {
            errorId: fullErrorInfo.id,
            type: fullErrorInfo.type,
            severity: fullErrorInfo.severity,
            component: fullErrorInfo.component
          }
        });
      }
      
      this.logger.log(`Recorded error ${fullErrorInfo.id} in component ${fullErrorInfo.component}`);
      return true;
    } catch (error) {
      this.logger.error(`Error recording error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get error by ID
   * @param errorId Error ID
   * @returns Promise resolving to error information or null
   */
  async getError(errorId: string): Promise<ErrorInfo | null> {
    try {
      const key = `${this.ERROR_PREFIX}:${errorId}`;
      const errorJson = await this.redisService.get(key);
      
      if (!errorJson) {
        return null;
      }

      const errorInfo: ErrorInfo = JSON.parse(errorJson);
      
      // Convert timestamp to Date object
      errorInfo.timestamp = new Date(errorInfo.timestamp);
      
      return errorInfo;
    } catch (error) {
      this.logger.error(`Error retrieving error ${errorId}: ${error.message}`);
      return null;
    }
  }

  /**
   * List errors with filtering
   * @param component Component name (optional)
   * @param severity Severity level (optional)
   * @param resolved Resolved status (optional)
   * @param limit Maximum number of errors to retrieve
   * @returns Promise resolving to array of error information
   */
  async listErrors(
    component?: string,
    severity?: string,
    resolved?: boolean,
    limit: number = 50
  ): Promise<ErrorInfo[]> {
    try {
      // In a real implementation, we would query the error store with filters
      // For now, we'll return an empty array as this would require a more complex query
      return [];
    } catch (error) {
      this.logger.error(`Error listing errors: ${error.message}`);
      return [];
    }
  }

  /**
   * Mark error as resolved
   * @param errorId Error ID
   * @param resolution Resolution information
   * @returns Promise resolving to boolean indicating success
   */
  async resolveError(errorId: string, resolution: string): Promise<boolean> {
    try {
      const errorInfo = await this.getError(errorId);
      
      if (!errorInfo) {
        return false;
      }

      errorInfo.resolved = true;
      errorInfo.resolution = resolution;
      
      const key = `${this.ERROR_PREFIX}:${errorId}`;
      await this.redisService.setex(key, 2592000, JSON.stringify(errorInfo)); // Store for 30 days
      
      // Notify that error has been resolved
      await this.notifyOnResolution(errorInfo);
      
      this.logger.log(`Resolved error ${errorId}: ${resolution}`);
      return true;
    } catch (error) {
      this.logger.error(`Error resolving error ${errorId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle error based on policy
   * @param error Error information
   * @returns Promise resolving to handling result
   */
  async handleError(error: ErrorInfo): Promise<boolean> {
    try {
      // Get error handling policy
      const policy = await this.getErrorPolicy(error.component, error.type);
      
      if (!policy) {
        // No specific policy, use default handling
        this.logger.warn(`No policy found for error ${error.type} in component ${error.component}`);
        return await this.defaultErrorHandling(error);
      }

      // Apply policy action
      switch (policy.action) {
        case 'retry':
          return await this.handleRetry(error, policy);
          
        case 'failover':
          return await this.handleFailover(error, policy);
          
        case 'ignore':
          return await this.handleIgnore(error);
          
        case 'notify':
          return await this.handleNotify(error, policy);
          
        case 'escalate':
          return await this.handleEscalate(error, policy);
          
        default:
          return await this.defaultErrorHandling(error);
      }
    } catch (handlingError) {
      this.logger.error(`Error handling error ${error.id}: ${handlingError.message}`);
      return false;
    }
  }

  /**
   * Create error handling policy
   * @param policy Error handling policy
   * @returns Promise resolving to boolean indicating success
   */
  async createErrorPolicy(policy: ErrorHandlingPolicy): Promise<boolean> {
    try {
      const key = `${this.ERROR_POLICY_PREFIX}:${policy.component}:${policy.errorType}`;
      await this.redisService.set(key, JSON.stringify(policy));
      
      this.logger.log(`Created error policy for ${policy.component}:${policy.errorType}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating error policy: ${error.message}`);
      return false;
    }
  }

  /**
   * Get error handling policy
   * @param component Component name
   * @param errorType Error type
   * @returns Promise resolving to error handling policy or null
   */
  async getErrorPolicy(component: string, errorType: string): Promise<ErrorHandlingPolicy | null> {
    try {
      const key = `${this.ERROR_POLICY_PREFIX}:${component}:${errorType}`;
      const policyJson = await this.redisService.get(key);
      
      if (!policyJson) {
        return null;
      }

      return JSON.parse(policyJson);
    } catch (error) {
      this.logger.error(`Error retrieving error policy for ${component}:${errorType}: ${error.message}`);
      return null;
    }
  }

  /**
   * Create recovery strategy
   * @param strategy Recovery strategy
   * @returns Promise resolving to boolean indicating success
   */
  async createRecoveryStrategy(strategy: RecoveryStrategy): Promise<boolean> {
    try {
      const key = `${this.RECOVERY_STRATEGY_PREFIX}:${strategy.id}`;
      await this.redisService.setex(key, 2592000, JSON.stringify(strategy)); // Store for 30 days
      
      this.logger.log(`Created recovery strategy ${strategy.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating recovery strategy ${strategy.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get recovery strategy
   * @param strategyId Strategy ID
   * @returns Promise resolving to recovery strategy or null
   */
  async getRecoveryStrategy(strategyId: string): Promise<RecoveryStrategy | null> {
    try {
      const key = `${this.RECOVERY_STRATEGY_PREFIX}:${strategyId}`;
      const strategyJson = await this.redisService.get(key);
      
      if (!strategyJson) {
        return null;
      }

      return JSON.parse(strategyJson);
    } catch (error) {
      this.logger.error(`Error retrieving recovery strategy ${strategyId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Execute recovery strategy
   * @param strategyId Strategy ID
   * @param context Execution context
   * @returns Promise resolving to boolean indicating success
   */
  async executeRecoveryStrategy(strategyId: string, context: Record<string, any>): Promise<boolean> {
    try {
      const strategy = await this.getRecoveryStrategy(strategyId);
      
      if (!strategy) {
        this.logger.error(`Recovery strategy ${strategyId} not found`);
        return false;
      }

      this.logger.log(`Executing recovery strategy ${strategyId}: ${strategy.name}`);
      
      // In a real implementation, we would execute the recovery steps
      // For now, we'll just simulate the execution
      for (const step of strategy.steps) {
        this.logger.log(`Executing recovery step: ${step}`);
        // Simulate step execution time
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.logger.log(`Recovery strategy ${strategyId} completed successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Error executing recovery strategy ${strategyId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get error statistics
   * @param component Component name (optional)
   * @returns Promise resolving to error statistics
   */
  async getErrorStats(component?: string): Promise<Record<string, number>> {
    try {
      const key = component 
        ? `${this.ERROR_STATS_PREFIX}:${component}` 
        : this.ERROR_STATS_PREFIX;
      
      const statsJson = await this.redisService.get(key);
      
      if (!statsJson) {
        return {};
      }

      return JSON.parse(statsJson);
    } catch (error) {
      this.logger.error(`Error retrieving error stats: ${error.message}`);
      return {};
    }
  }

  /**
   * Update error statistics
   * @param errorInfo Error information
   * @returns Promise resolving to boolean indicating success
   */
  private async updateErrorStats(errorInfo: ErrorInfo): Promise<boolean> {
    try {
      const key = `${this.ERROR_STATS_PREFIX}:${errorInfo.component}`;
      const statsJson = await this.redisService.get(key);
      const stats = statsJson ? JSON.parse(statsJson) : {};
      
      // Increment error count
      stats.total = (stats.total || 0) + 1;
      stats[errorInfo.type] = (stats[errorInfo.type] || 0) + 1;
      stats[errorInfo.severity] = (stats[errorInfo.severity] || 0) + 1;
      
      // Store updated stats
      await this.redisService.setex(key, 86400, JSON.stringify(stats)); // Store for 24 hours
      
      return true;
    } catch (error) {
      this.logger.error(`Error updating error stats: ${error.message}`);
      return false;
    }
  }

  /**
   * Notify relevant parties about error
   * @param errorInfo Error information
   * @returns Promise resolving to boolean indicating success
   */
  private async notifyOnError(errorInfo: ErrorInfo): Promise<boolean> {
    try {
      // Send WebSocket notification
      this.websocketGateway.broadcastSystemNotification({
        type: 'error_occurred',
        errorId: errorInfo.id,
        component: errorInfo.component,
        errorType: errorInfo.type,
        severity: errorInfo.severity,
        message: errorInfo.message,
        timestamp: errorInfo.timestamp.toISOString()
      });
      
      // In a real implementation, we would also send notifications via other channels
      // based on the error severity and notification policies
      
      return true;
    } catch (error) {
      this.logger.error(`Error notifying on error ${errorInfo.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Notify relevant parties about error resolution
   * @param errorInfo Error information
   * @returns Promise resolving to boolean indicating success
   */
  private async notifyOnResolution(errorInfo: ErrorInfo): Promise<boolean> {
    try {
      // Send WebSocket notification
      this.websocketGateway.broadcastSystemNotification({
        type: 'error_resolved',
        errorId: errorInfo.id,
        component: errorInfo.component,
        errorType: errorInfo.type,
        message: errorInfo.message,
        resolution: errorInfo.resolution,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error notifying on resolution of error ${errorInfo.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle retry action
   * @param error Error information
   * @param policy Error handling policy
   * @returns Promise resolving to boolean indicating success
   */
  private async handleRetry(error: ErrorInfo, policy: ErrorHandlingPolicy): Promise<boolean> {
    try {
      const maxRetries = policy.maxRetries || 3;
      const retryDelay = policy.retryDelay || 1000;
      
      this.logger.log(`Retrying error ${error.id} (max ${maxRetries} retries, ${retryDelay}ms delay)`);
      
      // In a real implementation, we would implement the actual retry logic
      // For now, we'll just simulate a successful retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      return true;
    } catch (error) {
      this.logger.error(`Error handling retry for error ${error.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle failover action
   * @param error Error information
   * @param policy Error handling policy
   * @returns Promise resolving to boolean indicating success
   */
  private async handleFailover(error: ErrorInfo, policy: ErrorHandlingPolicy): Promise<boolean> {
    try {
      const failoverTarget = policy.failoverTarget;
      
      if (!failoverTarget) {
        this.logger.error(`No failover target specified for error ${error.id}`);
        return false;
      }
      
      this.logger.log(`Failing over error ${error.id} to ${failoverTarget}`);
      
      // In a real implementation, we would implement the actual failover logic
      // For now, we'll just simulate a successful failover
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      this.logger.error(`Error handling failover for error ${error.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle ignore action
   * @param error Error information
   * @returns Promise resolving to boolean indicating success
   */
  private async handleIgnore(error: ErrorInfo): Promise<boolean> {
    try {
      this.logger.log(`Ignoring error ${error.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error handling ignore for error ${error.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle notify action
   * @param error Error information
   * @param policy Error handling policy
   * @returns Promise resolving to boolean indicating success
   */
  private async handleNotify(error: ErrorInfo, policy: ErrorHandlingPolicy): Promise<boolean> {
    try {
      const channels = policy.notificationChannels || ['system'];
      
      this.logger.log(`Notifying on error ${error.id} via channels: ${channels.join(', ')}`);
      
      // Send notifications
      for (const channel of channels) {
        this.websocketGateway.broadcastSystemNotification({
          type: 'error_notification',
          errorId: error.id,
          component: error.component,
          errorType: error.type,
          severity: error.severity,
          message: error.message,
          channel,
          timestamp: error.timestamp.toISOString()
        });
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Error handling notify for error ${error.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle escalate action
   * @param error Error information
   * @param policy Error handling policy
   * @returns Promise resolving to boolean indicating success
   */
  private async handleEscalate(error: ErrorInfo, policy: ErrorHandlingPolicy): Promise<boolean> {
    try {
      const escalationLevel = policy.escalationLevel || 'level1';
      
      this.logger.log(`Escalating error ${error.id} to ${escalationLevel}`);
      
      // Send escalation notification
      this.websocketGateway.broadcastSystemNotification({
        type: 'error_escalation',
        errorId: error.id,
        component: error.component,
        errorType: error.type,
        severity: error.severity,
        message: error.message,
        escalationLevel,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error handling escalation for error ${error.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Default error handling
   * @param error Error information
   * @returns Promise resolving to boolean indicating success
   */
  private async defaultErrorHandling(error: ErrorInfo): Promise<boolean> {
    try {
      this.logger.log(`Applying default error handling for error ${error.id}`);
      
      // For critical errors, escalate
      if (error.severity === 'critical') {
        return await this.handleEscalate(error, {
          component: error.component,
          errorType: error.type,
          action: 'escalate',
          escalationLevel: 'level3'
        });
      }
      
      // For high severity errors, notify
      if (error.severity === 'high') {
        return await this.handleNotify(error, {
          component: error.component,
          errorType: error.type,
          action: 'notify',
          notificationChannels: ['system', 'admin']
        });
      }
      
      // For medium and low severity errors, log and continue
      this.logger.warn(`Logged error ${error.id}: ${error.message}`);
      return true;
    } catch (error) {
      this.logger.error(`Error in default error handling for error ${error.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate unique error ID
   * @returns Error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}