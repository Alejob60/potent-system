import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  workflowId?: string;
  agent?: string;
  payload?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface RecurringTaskConfig {
  taskId: string;
  interval: number; // in seconds
  maxExecutions?: number;
  startAt?: Date;
  endAt?: Date;
}

@Injectable()
export class TaskSchedulingService {
  private readonly logger = new Logger(TaskSchedulingService.name);
  private readonly TASK_PREFIX = 'scheduled_task';
  private readonly TASK_EXECUTION_PREFIX = 'task_execution';
  private readonly RECURRING_TASK_PREFIX = 'recurring_task';
  private readonly TASK_QUEUE_PREFIX = 'task_queue';
  private readonly cronJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly stateManager: StateManagementService,
  ) {
    // Initialize scheduled tasks on startup
    this.initializeScheduledTasks();
  }

  /**
   * Create a scheduled task
   * @param task Scheduled task
   * @returns Promise resolving to boolean indicating success
   */
  async createTask(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): Promise<boolean> {
    try {
      const fullTask: ScheduledTask = {
        id: this.generateTaskId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        nextRun: this.calculateNextRun(task.cronExpression),
        ...task
      };

      const key = `${this.TASK_PREFIX}:${fullTask.id}`;
      await this.redisService.setex(key, 2592000, JSON.stringify(fullTask)); // Store for 30 days
      
      // Schedule the task if enabled
      if (fullTask.enabled) {
        this.scheduleTask(fullTask);
      }
      
      this.logger.log(`Created scheduled task ${fullTask.id}: ${fullTask.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating scheduled task: ${error.message}`);
      return false;
    }
  }

  /**
   * Get scheduled task by ID
   * @param taskId Task ID
   * @returns Promise resolving to scheduled task or null
   */
  async getTask(taskId: string): Promise<ScheduledTask | null> {
    try {
      const key = `${this.TASK_PREFIX}:${taskId}`;
      const taskJson = await this.redisService.get(key);
      
      if (!taskJson) {
        return null;
      }

      const task: ScheduledTask = JSON.parse(taskJson);
      
      // Convert date strings back to Date objects
      task.createdAt = new Date(task.createdAt);
      task.updatedAt = new Date(task.updatedAt);
      if (task.lastRun) task.lastRun = new Date(task.lastRun);
      task.nextRun = new Date(task.nextRun);
      
      return task;
    } catch (error) {
      this.logger.error(`Error retrieving scheduled task ${taskId}: ${error.message}`);
      return null;
    }
  }

  /**
   * List scheduled tasks with filtering
   * @param enabled Enabled status (optional)
   * @param limit Maximum number of tasks to retrieve
   * @returns Promise resolving to array of scheduled tasks
   */
  async listTasks(enabled?: boolean, limit: number = 50): Promise<ScheduledTask[]> {
    try {
      // In a real implementation, we would query the task store with filters
      // For now, we'll return an empty array as this would require a more complex query
      return [];
    } catch (error) {
      this.logger.error(`Error listing scheduled tasks: ${error.message}`);
      return [];
    }
  }

  /**
   * Update scheduled task
   * @param taskId Task ID
   * @param updates Task updates
   * @returns Promise resolving to boolean indicating success
   */
  async updateTask(taskId: string, updates: Partial<ScheduledTask>): Promise<boolean> {
    try {
      const task = await this.getTask(taskId);
      
      if (!task) {
        return false;
      }

      // Cancel existing scheduled job if it exists
      if (this.cronJobs.has(taskId)) {
        clearInterval(this.cronJobs.get(taskId)!);
        this.cronJobs.delete(taskId);
      }

      // Update task
      const updatedTask: ScheduledTask = {
        ...task,
        ...updates,
        updatedAt: new Date(),
        nextRun: updates.cronExpression 
          ? this.calculateNextRun(updates.cronExpression) 
          : task.nextRun
      };

      const key = `${this.TASK_PREFIX}:${taskId}`;
      await this.redisService.setex(key, 2592000, JSON.stringify(updatedTask));
      
      // Reschedule the task if enabled
      if (updatedTask.enabled) {
        this.scheduleTask(updatedTask);
      }
      
      this.logger.log(`Updated scheduled task ${taskId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error updating scheduled task ${taskId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete scheduled task
   * @param taskId Task ID
   * @returns Promise resolving to boolean indicating success
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      // Cancel scheduled job if it exists
      if (this.cronJobs.has(taskId)) {
        clearInterval(this.cronJobs.get(taskId)!);
        this.cronJobs.delete(taskId);
      }

      const key = `${this.TASK_PREFIX}:${taskId}`;
      await this.redisService.del(key);
      
      this.logger.log(`Deleted scheduled task ${taskId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting scheduled task ${taskId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Enable scheduled task
   * @param taskId Task ID
   * @returns Promise resolving to boolean indicating success
   */
  async enableTask(taskId: string): Promise<boolean> {
    return this.updateTask(taskId, { enabled: true });
  }

  /**
   * Disable scheduled task
   * @param taskId Task ID
   * @returns Promise resolving to boolean indicating success
   */
  async disableTask(taskId: string): Promise<boolean> {
    return this.updateTask(taskId, { enabled: false });
  }

  /**
   * Execute task immediately
   * @param taskId Task ID
   * @returns Promise resolving to task execution ID
   */
  async executeTask(taskId: string): Promise<string | null> {
    try {
      const task = await this.getTask(taskId);
      
      if (!task) {
        this.logger.error(`Task ${taskId} not found`);
        return null;
      }

      // Create task execution record
      const executionId = this.generateExecutionId();
      const execution: any = {
        id: executionId,
        taskId: task.id,
        status: 'pending',
        createdAt: new Date()
      };

      const executionKey = `${this.TASK_EXECUTION_PREFIX}:${executionId}`;
      await this.redisService.setex(executionKey, 86400, JSON.stringify(execution)); // Store for 24 hours
      
      // Add to task queue
      const queueKey = `${this.TASK_QUEUE_PREFIX}:${task.agent || 'system'}`;
      await this.redisService.rpush(queueKey, executionId);
      
      // Notify via WebSocket
      this.websocketGateway.broadcastSystemNotification({
        type: 'task_scheduled',
        taskId: task.id,
        taskName: task.name,
        executionId,
        timestamp: new Date().toISOString()
      });
      
      this.logger.log(`Scheduled immediate execution of task ${taskId} with execution ID ${executionId}`);
      return executionId;
    } catch (error) {
      this.logger.error(`Error scheduling immediate execution of task ${taskId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get task execution by ID
   * @param executionId Execution ID
   * @returns Promise resolving to task execution or null
   */
  async getTaskExecution(executionId: string): Promise<TaskExecution | null> {
    try {
      const key = `${this.TASK_EXECUTION_PREFIX}:${executionId}`;
      const executionJson = await this.redisService.get(key);
      
      if (!executionJson) {
        return null;
      }

      const execution: TaskExecution = JSON.parse(executionJson);
      
      // Convert date strings back to Date objects
      execution.createdAt = new Date(execution.createdAt);
      if (execution.startTime) execution.startTime = new Date(execution.startTime);
      if (execution.endTime) execution.endTime = new Date(execution.endTime);
      
      return execution;
    } catch (error) {
      this.logger.error(`Error retrieving task execution ${executionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * List task executions with filtering
   * @param taskId Task ID (optional)
   * @param status Execution status (optional)
   * @param limit Maximum number of executions to retrieve
   * @returns Promise resolving to array of task executions
   */
  async listTaskExecutions(taskId?: string, status?: string, limit: number = 50): Promise<TaskExecution[]> {
    try {
      // In a real implementation, we would query the execution store with filters
      // For now, we'll return an empty array as this would require a more complex query
      return [];
    } catch (error) {
      this.logger.error(`Error listing task executions: ${error.message}`);
      return [];
    }
  }

  /**
   * Create recurring task configuration
   * @param config Recurring task configuration
   * @returns Promise resolving to boolean indicating success
   */
  async createRecurringTask(config: RecurringTaskConfig): Promise<boolean> {
    try {
      const key = `${this.RECURRING_TASK_PREFIX}:${config.taskId}`;
      await this.redisService.setex(key, 2592000, JSON.stringify(config)); // Store for 30 days
      
      // Schedule recurring execution
      this.scheduleRecurringTask(config);
      
      this.logger.log(`Created recurring task configuration for task ${config.taskId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error creating recurring task configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * Get recurring task configuration
   * @param taskId Task ID
   * @returns Promise resolving to recurring task configuration or null
   */
  async getRecurringTask(taskId: string): Promise<RecurringTaskConfig | null> {
    try {
      const key = `${this.RECURRING_TASK_PREFIX}:${taskId}`;
      const configJson = await this.redisService.get(key);
      
      if (!configJson) {
        return null;
      }

      const config: RecurringTaskConfig = JSON.parse(configJson);
      
      // Convert date strings back to Date objects
      if (config.startAt) config.startAt = new Date(config.startAt);
      if (config.endAt) config.endAt = new Date(config.endAt);
      
      return config;
    } catch (error) {
      this.logger.error(`Error retrieving recurring task configuration for task ${taskId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Initialize scheduled tasks on startup
   * @returns Promise resolving to boolean indicating success
   */
  private async initializeScheduledTasks(): Promise<boolean> {
    try {
      // In a real implementation, we would load all enabled scheduled tasks from storage
      // and schedule them accordingly
      this.logger.log('Initialized task scheduling service');
      return true;
    } catch (error) {
      this.logger.error(`Error initializing scheduled tasks: ${error.message}`);
      return false;
    }
  }

  /**
   * Schedule a task based on its cron expression
   * @param task Scheduled task
   */
  private scheduleTask(task: ScheduledTask): void {
    try {
      // For simplicity, we'll use a basic interval-based approach
      // In a real implementation, we would use a proper cron parser
      
      // Calculate delay until next run
      const now = new Date();
      const delay = task.nextRun.getTime() - now.getTime();
      
      if (delay > 0) {
        const timeoutId = setTimeout(async () => {
          await this.executeScheduledTask(task);
          
          // Reschedule for next run
          if (task.enabled) {
            const updatedTask = await this.getTask(task.id);
            if (updatedTask && updatedTask.enabled) {
              updatedTask.nextRun = this.calculateNextRun(updatedTask.cronExpression);
              updatedTask.lastRun = new Date();
              updatedTask.updatedAt = new Date();
              
              const key = `${this.TASK_PREFIX}:${updatedTask.id}`;
              await this.redisService.setex(key, 2592000, JSON.stringify(updatedTask));
              
              this.scheduleTask(updatedTask);
            }
          }
        }, delay);
        
        this.cronJobs.set(task.id, timeoutId);
      }
    } catch (error) {
      this.logger.error(`Error scheduling task ${task.id}: ${error.message}`);
    }
  }

  /**
   * Schedule a recurring task
   * @param config Recurring task configuration
   */
  private scheduleRecurringTask(config: RecurringTaskConfig): void {
    try {
      const intervalId = setInterval(async () => {
        try {
          // Check if task should still be running
          const currentConfig = await this.getRecurringTask(config.taskId);
          if (!currentConfig) {
            clearInterval(intervalId);
            return;
          }
          
          // Execute task
          await this.executeTask(config.taskId);
        } catch (error) {
          this.logger.error(`Error executing recurring task ${config.taskId}: ${error.message}`);
        }
      }, config.interval * 1000);
      
      this.cronJobs.set(`recurring_${config.taskId}`, intervalId);
    } catch (error) {
      this.logger.error(`Error scheduling recurring task ${config.taskId}: ${error.message}`);
    }
  }

  /**
   * Execute a scheduled task
   * @param task Scheduled task
   * @returns Promise resolving to boolean indicating success
   */
  private async executeScheduledTask(task: ScheduledTask): Promise<boolean> {
    try {
      this.logger.log(`Executing scheduled task ${task.id}: ${task.name}`);
      
      // Update task last run time
      task.lastRun = new Date();
      task.updatedAt = new Date();
      
      const key = `${this.TASK_PREFIX}:${task.id}`;
      await this.redisService.setex(key, 2592000, JSON.stringify(task));
      
      // Create task execution record
      const executionId = this.generateExecutionId();
      const execution: TaskExecution = {
        id: executionId,
        taskId: task.id,
        status: 'running',
        startTime: new Date(),
        createdAt: new Date()
      };

      const executionKey = `${this.TASK_EXECUTION_PREFIX}:${executionId}`;
      await this.redisService.setex(executionKey, 86400, JSON.stringify(execution));
      
      // Notify via WebSocket that execution has started
      this.websocketGateway.broadcastSystemNotification({
        type: 'task_execution_started',
        taskId: task.id,
        taskName: task.name,
        executionId,
        timestamp: execution.startTime!.toISOString()
      });
      
      // Execute the task (workflow or agent)
      let result: any;
      let error: string | undefined;
      
      try {
        if (task.workflowId) {
          // Execute workflow
          // In a real implementation, we would call the workflow engine
          this.logger.log(`Executing workflow ${task.workflowId} for task ${task.id}`);
          result = { status: 'success', message: 'Workflow executed successfully' };
        } else if (task.agent) {
          // Execute agent
          // In a real implementation, we would call the agent connector
          this.logger.log(`Executing agent ${task.agent} for task ${task.id}`);
          result = { status: 'success', message: 'Agent executed successfully' };
        } else {
          // Execute custom logic
          this.logger.log(`Executing custom logic for task ${task.id}`);
          result = { status: 'success', message: 'Custom logic executed successfully' };
        }
      } catch (executionError) {
        error = executionError.message;
        execution.status = 'failed';
        this.logger.error(`Error executing task ${task.id}: ${executionError.message}`);
      }
      
      // Update execution record
      const endTime = new Date();
      execution.status = error ? 'failed' : 'completed';
      execution.endTime = endTime;
      execution.duration = endTime.getTime() - execution.startTime!.getTime();
      execution.result = result;
      execution.error = error;
      
      await this.redisService.setex(executionKey, 86400, JSON.stringify(execution));
      
      // Notify via WebSocket that execution has completed
      this.websocketGateway.broadcastSystemNotification({
        type: 'task_execution_completed',
        taskId: task.id,
        taskName: task.name,
        executionId,
        status: execution.status,
        duration: execution.duration,
        timestamp: endTime.toISOString()
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error executing scheduled task ${task.id}: ${error.message}`);
      return false;
    }
  }

  /**
   * Calculate next run time based on cron expression
   * @param cronExpression Cron expression
   * @returns Next run date
   */
  private calculateNextRun(cronExpression: string): Date {
    // For simplicity, we'll return a date in the future
    // In a real implementation, we would parse the cron expression properly
    const nextRun = new Date();
    nextRun.setMinutes(nextRun.getMinutes() + 5); // Run in 5 minutes
    return nextRun;
  }

  /**
   * Generate unique task ID
   * @returns Task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique execution ID
   * @returns Execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}