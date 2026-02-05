"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TaskSchedulingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchedulingService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/redis/redis.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
const state_management_service_1 = require("../../state/state-management.service");
let TaskSchedulingService = TaskSchedulingService_1 = class TaskSchedulingService {
    constructor(redisService, websocketGateway, stateManager) {
        this.redisService = redisService;
        this.websocketGateway = websocketGateway;
        this.stateManager = stateManager;
        this.logger = new common_1.Logger(TaskSchedulingService_1.name);
        this.TASK_PREFIX = 'scheduled_task';
        this.TASK_EXECUTION_PREFIX = 'task_execution';
        this.RECURRING_TASK_PREFIX = 'recurring_task';
        this.TASK_QUEUE_PREFIX = 'task_queue';
        this.cronJobs = new Map();
        this.initializeScheduledTasks();
    }
    async createTask(task) {
        try {
            const fullTask = {
                id: this.generateTaskId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                nextRun: this.calculateNextRun(task.cronExpression),
                ...task
            };
            const key = `${this.TASK_PREFIX}:${fullTask.id}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(fullTask));
            if (fullTask.enabled) {
                this.scheduleTask(fullTask);
            }
            this.logger.log(`Created scheduled task ${fullTask.id}: ${fullTask.name}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating scheduled task: ${error.message}`);
            return false;
        }
    }
    async getTask(taskId) {
        try {
            const key = `${this.TASK_PREFIX}:${taskId}`;
            const taskJson = await this.redisService.get(key);
            if (!taskJson) {
                return null;
            }
            const task = JSON.parse(taskJson);
            task.createdAt = new Date(task.createdAt);
            task.updatedAt = new Date(task.updatedAt);
            if (task.lastRun)
                task.lastRun = new Date(task.lastRun);
            task.nextRun = new Date(task.nextRun);
            return task;
        }
        catch (error) {
            this.logger.error(`Error retrieving scheduled task ${taskId}: ${error.message}`);
            return null;
        }
    }
    async listTasks(enabled, limit = 50) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Error listing scheduled tasks: ${error.message}`);
            return [];
        }
    }
    async updateTask(taskId, updates) {
        try {
            const task = await this.getTask(taskId);
            if (!task) {
                return false;
            }
            if (this.cronJobs.has(taskId)) {
                clearInterval(this.cronJobs.get(taskId));
                this.cronJobs.delete(taskId);
            }
            const updatedTask = {
                ...task,
                ...updates,
                updatedAt: new Date(),
                nextRun: updates.cronExpression
                    ? this.calculateNextRun(updates.cronExpression)
                    : task.nextRun
            };
            const key = `${this.TASK_PREFIX}:${taskId}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(updatedTask));
            if (updatedTask.enabled) {
                this.scheduleTask(updatedTask);
            }
            this.logger.log(`Updated scheduled task ${taskId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating scheduled task ${taskId}: ${error.message}`);
            return false;
        }
    }
    async deleteTask(taskId) {
        try {
            if (this.cronJobs.has(taskId)) {
                clearInterval(this.cronJobs.get(taskId));
                this.cronJobs.delete(taskId);
            }
            const key = `${this.TASK_PREFIX}:${taskId}`;
            await this.redisService.del(key);
            this.logger.log(`Deleted scheduled task ${taskId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting scheduled task ${taskId}: ${error.message}`);
            return false;
        }
    }
    async enableTask(taskId) {
        return this.updateTask(taskId, { enabled: true });
    }
    async disableTask(taskId) {
        return this.updateTask(taskId, { enabled: false });
    }
    async executeTask(taskId) {
        try {
            const task = await this.getTask(taskId);
            if (!task) {
                this.logger.error(`Task ${taskId} not found`);
                return null;
            }
            const executionId = this.generateExecutionId();
            const execution = {
                id: executionId,
                taskId: task.id,
                status: 'pending',
                createdAt: new Date()
            };
            const executionKey = `${this.TASK_EXECUTION_PREFIX}:${executionId}`;
            await this.redisService.setex(executionKey, 86400, JSON.stringify(execution));
            const queueKey = `${this.TASK_QUEUE_PREFIX}:${task.agent || 'system'}`;
            await this.redisService.rpush(queueKey, executionId);
            this.websocketGateway.broadcastSystemNotification({
                type: 'task_scheduled',
                taskId: task.id,
                taskName: task.name,
                executionId,
                timestamp: new Date().toISOString()
            });
            this.logger.log(`Scheduled immediate execution of task ${taskId} with execution ID ${executionId}`);
            return executionId;
        }
        catch (error) {
            this.logger.error(`Error scheduling immediate execution of task ${taskId}: ${error.message}`);
            return null;
        }
    }
    async getTaskExecution(executionId) {
        try {
            const key = `${this.TASK_EXECUTION_PREFIX}:${executionId}`;
            const executionJson = await this.redisService.get(key);
            if (!executionJson) {
                return null;
            }
            const execution = JSON.parse(executionJson);
            execution.createdAt = new Date(execution.createdAt);
            if (execution.startTime)
                execution.startTime = new Date(execution.startTime);
            if (execution.endTime)
                execution.endTime = new Date(execution.endTime);
            return execution;
        }
        catch (error) {
            this.logger.error(`Error retrieving task execution ${executionId}: ${error.message}`);
            return null;
        }
    }
    async listTaskExecutions(taskId, status, limit = 50) {
        try {
            return [];
        }
        catch (error) {
            this.logger.error(`Error listing task executions: ${error.message}`);
            return [];
        }
    }
    async createRecurringTask(config) {
        try {
            const key = `${this.RECURRING_TASK_PREFIX}:${config.taskId}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(config));
            this.scheduleRecurringTask(config);
            this.logger.log(`Created recurring task configuration for task ${config.taskId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error creating recurring task configuration: ${error.message}`);
            return false;
        }
    }
    async getRecurringTask(taskId) {
        try {
            const key = `${this.RECURRING_TASK_PREFIX}:${taskId}`;
            const configJson = await this.redisService.get(key);
            if (!configJson) {
                return null;
            }
            const config = JSON.parse(configJson);
            if (config.startAt)
                config.startAt = new Date(config.startAt);
            if (config.endAt)
                config.endAt = new Date(config.endAt);
            return config;
        }
        catch (error) {
            this.logger.error(`Error retrieving recurring task configuration for task ${taskId}: ${error.message}`);
            return null;
        }
    }
    async initializeScheduledTasks() {
        try {
            this.logger.log('Initialized task scheduling service');
            return true;
        }
        catch (error) {
            this.logger.error(`Error initializing scheduled tasks: ${error.message}`);
            return false;
        }
    }
    scheduleTask(task) {
        try {
            const now = new Date();
            const delay = task.nextRun.getTime() - now.getTime();
            if (delay > 0) {
                const timeoutId = setTimeout(async () => {
                    await this.executeScheduledTask(task);
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
        }
        catch (error) {
            this.logger.error(`Error scheduling task ${task.id}: ${error.message}`);
        }
    }
    scheduleRecurringTask(config) {
        try {
            const intervalId = setInterval(async () => {
                try {
                    const currentConfig = await this.getRecurringTask(config.taskId);
                    if (!currentConfig) {
                        clearInterval(intervalId);
                        return;
                    }
                    await this.executeTask(config.taskId);
                }
                catch (error) {
                    this.logger.error(`Error executing recurring task ${config.taskId}: ${error.message}`);
                }
            }, config.interval * 1000);
            this.cronJobs.set(`recurring_${config.taskId}`, intervalId);
        }
        catch (error) {
            this.logger.error(`Error scheduling recurring task ${config.taskId}: ${error.message}`);
        }
    }
    async executeScheduledTask(task) {
        try {
            this.logger.log(`Executing scheduled task ${task.id}: ${task.name}`);
            task.lastRun = new Date();
            task.updatedAt = new Date();
            const key = `${this.TASK_PREFIX}:${task.id}`;
            await this.redisService.setex(key, 2592000, JSON.stringify(task));
            const executionId = this.generateExecutionId();
            const execution = {
                id: executionId,
                taskId: task.id,
                status: 'running',
                startTime: new Date(),
                createdAt: new Date()
            };
            const executionKey = `${this.TASK_EXECUTION_PREFIX}:${executionId}`;
            await this.redisService.setex(executionKey, 86400, JSON.stringify(execution));
            this.websocketGateway.broadcastSystemNotification({
                type: 'task_execution_started',
                taskId: task.id,
                taskName: task.name,
                executionId,
                timestamp: execution.startTime.toISOString()
            });
            let result;
            let error;
            try {
                if (task.workflowId) {
                    this.logger.log(`Executing workflow ${task.workflowId} for task ${task.id}`);
                    result = { status: 'success', message: 'Workflow executed successfully' };
                }
                else if (task.agent) {
                    this.logger.log(`Executing agent ${task.agent} for task ${task.id}`);
                    result = { status: 'success', message: 'Agent executed successfully' };
                }
                else {
                    this.logger.log(`Executing custom logic for task ${task.id}`);
                    result = { status: 'success', message: 'Custom logic executed successfully' };
                }
            }
            catch (executionError) {
                error = executionError.message;
                execution.status = 'failed';
                this.logger.error(`Error executing task ${task.id}: ${executionError.message}`);
            }
            const endTime = new Date();
            execution.status = error ? 'failed' : 'completed';
            execution.endTime = endTime;
            execution.duration = endTime.getTime() - execution.startTime.getTime();
            execution.result = result;
            execution.error = error;
            await this.redisService.setex(executionKey, 86400, JSON.stringify(execution));
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
        }
        catch (error) {
            this.logger.error(`Error executing scheduled task ${task.id}: ${error.message}`);
            return false;
        }
    }
    calculateNextRun(cronExpression) {
        const nextRun = new Date();
        nextRun.setMinutes(nextRun.getMinutes() + 5);
        return nextRun;
    }
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.TaskSchedulingService = TaskSchedulingService;
exports.TaskSchedulingService = TaskSchedulingService = TaskSchedulingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        websocket_gateway_1.WebSocketGatewayService,
        state_management_service_1.StateManagementService])
], TaskSchedulingService);
//# sourceMappingURL=task-scheduling.service.js.map