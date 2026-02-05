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
    interval: number;
    maxExecutions?: number;
    startAt?: Date;
    endAt?: Date;
}
export declare class TaskSchedulingService {
    private readonly redisService;
    private readonly websocketGateway;
    private readonly stateManager;
    private readonly logger;
    private readonly TASK_PREFIX;
    private readonly TASK_EXECUTION_PREFIX;
    private readonly RECURRING_TASK_PREFIX;
    private readonly TASK_QUEUE_PREFIX;
    private readonly cronJobs;
    constructor(redisService: RedisService, websocketGateway: WebSocketGatewayService, stateManager: StateManagementService);
    createTask(task: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): Promise<boolean>;
    getTask(taskId: string): Promise<ScheduledTask | null>;
    listTasks(enabled?: boolean, limit?: number): Promise<ScheduledTask[]>;
    updateTask(taskId: string, updates: Partial<ScheduledTask>): Promise<boolean>;
    deleteTask(taskId: string): Promise<boolean>;
    enableTask(taskId: string): Promise<boolean>;
    disableTask(taskId: string): Promise<boolean>;
    executeTask(taskId: string): Promise<string | null>;
    getTaskExecution(executionId: string): Promise<TaskExecution | null>;
    listTaskExecutions(taskId?: string, status?: string, limit?: number): Promise<TaskExecution[]>;
    createRecurringTask(config: RecurringTaskConfig): Promise<boolean>;
    getRecurringTask(taskId: string): Promise<RecurringTaskConfig | null>;
    private initializeScheduledTasks;
    private scheduleTask;
    private scheduleRecurringTask;
    private executeScheduledTask;
    private calculateNextRun;
    private generateTaskId;
    private generateExecutionId;
}
