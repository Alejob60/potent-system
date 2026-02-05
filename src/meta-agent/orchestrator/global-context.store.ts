import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';

export interface GlobalContext {
  sessionId: string;
  tenantId: string;
  userId?: string;
  workflowId?: string;
  executionId?: string;
  sharedData: Record<string, any>;
  agentStates: Record<string, any>;
  metrics: {
    startTime: Date;
    lastUpdate: Date;
    stepCount: number;
    agentInvocations: number;
  };
  security: {
    permissions: string[];
    accessTokens: Record<string, string>;
    auditTrail: Array<{
      action: string;
      timestamp: Date;
      actor: string;
      details?: any;
    }>;
  };
}

@Injectable()
export class GlobalContextStore {
  private readonly logger = new Logger(GlobalContextStore.name);
  private readonly CONTEXT_PREFIX = 'global_context';
  private readonly CONTEXT_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly redisService: RedisService,
    private readonly stateManager: StateManagementService,
  ) {}

  /**
   * Create a new global context
   * @param sessionId Session ID
   * @param tenantId Tenant ID
   * @param userId User ID (optional)
   * @returns Promise resolving to created context
   */
  async createContext(
    sessionId: string,
    tenantId: string,
    userId?: string
  ): Promise<GlobalContext> {
    this.logger.log(`Creating global context for session: ${sessionId}, tenant: ${tenantId}`);

    const context: GlobalContext = {
      sessionId,
      tenantId,
      userId,
      sharedData: {},
      agentStates: {},
      metrics: {
        startTime: new Date(),
        lastUpdate: new Date(),
        stepCount: 0,
        agentInvocations: 0
      },
      security: {
        permissions: [],
        accessTokens: {},
        auditTrail: []
      }
    };

    await this.saveContext(context);
    return context;
  }

  /**
   * Get global context by session ID
   * @param sessionId Session ID
   * @returns Promise resolving to context or null if not found
   */
  async getContext(sessionId: string): Promise<GlobalContext | null> {
    try {
      const key = `${this.CONTEXT_PREFIX}:${sessionId}`;
      const contextJson = await this.redisService.get(key);
      
      if (!contextJson) {
        return null;
      }

      const context = JSON.parse(contextJson);
      
      // Convert date strings back to Date objects
      context.metrics.startTime = new Date(context.metrics.startTime);
      context.metrics.lastUpdate = new Date(context.metrics.lastUpdate);
      context.security.auditTrail = context.security.auditTrail.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));

      return context;
    } catch (error) {
      this.logger.error(`Error retrieving context for session ${sessionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Save global context
   * @param context Context to save
   * @returns Promise resolving to boolean indicating success
   */
  async saveContext(context: GlobalContext): Promise<boolean> {
    try {
      const key = `${this.CONTEXT_PREFIX}:${context.sessionId}`;
      const contextJson = JSON.stringify(context);
      
      await this.redisService.setex(key, this.CONTEXT_TTL, contextJson);
      return true;
    } catch (error) {
      this.logger.error(`Error saving context for session ${context.sessionId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Update shared data in context
   * @param sessionId Session ID
   * @param data Data to merge into shared data
   * @returns Promise resolving to boolean indicating success
   */
  async updateSharedData(sessionId: string, data: Record<string, any>): Promise<boolean> {
    const context = await this.getContext(sessionId);
    if (!context) {
      return false;
    }

    context.sharedData = { ...context.sharedData, ...data };
    context.metrics.lastUpdate = new Date();
    
    return this.saveContext(context);
  }

  /**
   * Update agent state in context
   * @param sessionId Session ID
   * @param agentName Agent name
   * @param state State data
   * @returns Promise resolving to boolean indicating success
   */
  async updateAgentState(sessionId: string, agentName: string, state: any): Promise<boolean> {
    const context = await this.getContext(sessionId);
    if (!context) {
      return false;
    }

    context.agentStates[agentName] = state;
    context.metrics.lastUpdate = new Date();
    context.metrics.agentInvocations += 1;
    
    return this.saveContext(context);
  }

  /**
   * Increment step count in context
   * @param sessionId Session ID
   * @returns Promise resolving to boolean indicating success
   */
  async incrementStepCount(sessionId: string): Promise<boolean> {
    const context = await this.getContext(sessionId);
    if (!context) {
      return false;
    }

    context.metrics.stepCount += 1;
    context.metrics.lastUpdate = new Date();
    
    return this.saveContext(context);
  }

  /**
   * Add audit trail entry
   * @param sessionId Session ID
   * @param action Action performed
   * @param actor Actor performing the action
   * @param details Additional details (optional)
   * @returns Promise resolving to boolean indicating success
   */
  async addAuditTrailEntry(
    sessionId: string,
    action: string,
    actor: string,
    details?: any
  ): Promise<boolean> {
    const context = await this.getContext(sessionId);
    if (!context) {
      return false;
    }

    context.security.auditTrail.push({
      action,
      actor,
      timestamp: new Date(),
      details
    });

    // Keep only the last 100 entries
    if (context.security.auditTrail.length > 100) {
      context.security.auditTrail = context.security.auditTrail.slice(-100);
    }

    return this.saveContext(context);
  }

  /**
   * Set workflow and execution IDs
   * @param sessionId Session ID
   * @param workflowId Workflow ID
   * @param executionId Execution ID
   * @returns Promise resolving to boolean indicating success
   */
  async setWorkflowExecution(
    sessionId: string,
    workflowId: string,
    executionId: string
  ): Promise<boolean> {
    const context = await this.getContext(sessionId);
    if (!context) {
      return false;
    }

    context.workflowId = workflowId;
    context.executionId = executionId;
    context.metrics.lastUpdate = new Date();
    
    return this.saveContext(context);
  }

  /**
   * Delete context
   * @param sessionId Session ID
   * @returns Promise resolving to boolean indicating success
   */
  async deleteContext(sessionId: string): Promise<boolean> {
    try {
      const key = `${this.CONTEXT_PREFIX}:${sessionId}`;
      await this.redisService.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting context for session ${sessionId}: ${error.message}`);
      return false;
    }
  }
}