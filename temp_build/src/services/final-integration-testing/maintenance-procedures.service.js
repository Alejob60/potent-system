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
var MaintenanceProceduresService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceProceduresService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let MaintenanceProceduresService = MaintenanceProceduresService_1 = class MaintenanceProceduresService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(MaintenanceProceduresService_1.name);
        this.executions = new Map();
        this.backups = new Map();
        this.healthHistory = [];
    }
    configure(config) {
        this.config = config;
        this.logger.log(`Maintenance service configured with ${config.routines.length} routines`);
        this.startScheduledRoutines();
        setInterval(() => {
            this.performHealthCheck();
        }, this.config.monitoring.healthCheckInterval * 1000);
    }
    startScheduledRoutines() {
        for (const routine of this.config.routines) {
            const scheduleTime = this.parseScheduleTime(routine.schedule.time);
            if (scheduleTime) {
                setTimeout(() => {
                    this.executeRoutine(routine.name);
                }, scheduleTime);
            }
        }
    }
    parseScheduleTime(time) {
        if (time === 'daily') {
            return 24 * 60 * 60 * 1000;
        }
        else if (time === 'weekly') {
            return 7 * 24 * 60 * 60 * 1000;
        }
        else if (time === 'monthly') {
            return 30 * 24 * 60 * 60 * 1000;
        }
        return null;
    }
    async executeRoutine(routineName) {
        const routine = this.config.routines.find(r => r.name === routineName);
        if (!routine) {
            throw new Error(`Routine ${routineName} not found`);
        }
        const executionId = this.generateExecutionId();
        const startTime = Date.now();
        const execution = {
            id: executionId,
            routineName,
            status: 'running',
            startTime: new Date(startTime),
            retryCount: 0,
        };
        this.executions.set(executionId, execution);
        this.logger.log(`Starting execution of routine ${routineName}`);
        try {
            let output = '';
            let lastError = null;
            for (let attempt = 0; attempt <= routine.execution.retryAttempts; attempt++) {
                try {
                    output = await this.runRoutineScript(routine.execution.script);
                    lastError = null;
                    break;
                }
                catch (error) {
                    lastError = error;
                    execution.retryCount = attempt + 1;
                    if (attempt < routine.execution.retryAttempts) {
                        this.logger.warn(`Routine ${routineName} failed (attempt ${attempt + 1}/${routine.execution.retryAttempts + 1}), retrying in ${routine.execution.retryDelay} seconds: ${error.message}`);
                        await new Promise(resolve => setTimeout(resolve, routine.execution.retryDelay * 1000));
                    }
                }
            }
            const endTime = Date.now();
            const duration = endTime - startTime;
            if (lastError) {
                execution.status = 'failed';
                execution.endTime = new Date(endTime);
                execution.duration = duration;
                execution.error = lastError.message;
                this.logger.error(`Routine ${routineName} failed after ${routine.execution.retryAttempts + 1} attempts: ${lastError.message}`);
                if (routine.notifications.onFailure) {
                    await this.sendNotifications(routine, execution, false);
                }
            }
            else {
                execution.status = 'completed';
                execution.endTime = new Date(endTime);
                execution.duration = duration;
                execution.output = output;
                this.logger.log(`Routine ${routineName} completed successfully in ${duration}ms`);
                if (routine.notifications.onSuccess) {
                    await this.sendNotifications(routine, execution, true);
                }
                if (routine.type === 'backup') {
                    await this.handleBackupCompletion(execution, output);
                }
            }
            this.executions.set(executionId, execution);
            return execution;
        }
        catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            execution.status = 'failed';
            execution.endTime = new Date(endTime);
            execution.duration = duration;
            execution.error = error.message;
            this.executions.set(executionId, execution);
            this.logger.error(`Routine ${routineName} execution failed: ${error.message}`);
            if (routine.notifications.onFailure) {
                await this.sendNotifications(routine, execution, false);
            }
            return execution;
        }
    }
    async runRoutineScript(script) {
        this.logger.log(`Running routine script: ${script}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `Script ${script} executed successfully`;
    }
    async handleBackupCompletion(execution, output) {
        const backupInfo = {
            id: `backup_${Date.now()}`,
            timestamp: new Date(),
            location: this.config.backup.storage.primary,
            size: Math.floor(Math.random() * 1000000000),
            status: 'created',
            encrypted: this.config.backup.storage.encryption,
        };
        this.backups.set(backupInfo.id, backupInfo);
        this.logger.log(`Backup created: ${backupInfo.id}`);
        await this.verifyBackup(backupInfo.id);
    }
    async verifyBackup(backupId) {
        const backup = this.backups.get(backupId);
        if (!backup) {
            return;
        }
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            backup.status = 'verified';
            backup.checksum = 'checksum_' + Math.random().toString(36).substring(7);
            this.backups.set(backupId, backup);
            this.logger.log(`Backup verified: ${backupId}`);
        }
        catch (error) {
            backup.status = 'failed';
            this.backups.set(backupId, backup);
            this.logger.error(`Backup verification failed for ${backupId}: ${error.message}`);
        }
    }
    async performHealthCheck() {
        try {
            const metrics = await this.collectSystemMetrics();
            let status = 'healthy';
            const issues = [];
            if (metrics.cpu > this.config.monitoring.alertThresholds.cpu) {
                status = metrics.cpu > this.config.monitoring.alertThresholds.cpu * 1.5 ? 'unhealthy' : 'degraded';
                issues.push(`CPU usage high: ${metrics.cpu}%`);
            }
            if (metrics.memory > this.config.monitoring.alertThresholds.memory) {
                status = metrics.memory > this.config.monitoring.alertThresholds.memory * 1.5 ? 'unhealthy' : 'degraded';
                issues.push(`Memory usage high: ${metrics.memory}%`);
            }
            if (metrics.disk > this.config.monitoring.alertThresholds.disk) {
                status = metrics.disk > this.config.monitoring.alertThresholds.disk * 1.5 ? 'unhealthy' : 'degraded';
                issues.push(`Disk usage high: ${metrics.disk}%`);
            }
            if (metrics.responseTime > this.config.monitoring.alertThresholds.responseTime) {
                status = metrics.responseTime > this.config.monitoring.alertThresholds.responseTime * 2 ? 'unhealthy' : 'degraded';
                issues.push(`Response time slow: ${metrics.responseTime}ms`);
            }
            const health = {
                timestamp: new Date(),
                metrics,
                status,
                issues,
            };
            this.healthHistory.push(health);
            if (this.healthHistory.length > 100) {
                this.healthHistory.shift();
            }
            if (status !== 'healthy') {
                this.logger.warn(`System health ${status}: ${issues.join(', ')}`);
            }
            else {
                this.logger.log('System health check completed: healthy');
            }
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
        }
    }
    async collectSystemMetrics() {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            cpu: Math.floor(Math.random() * 100),
            memory: Math.floor(Math.random() * 100),
            disk: Math.floor(Math.random() * 100),
            responseTime: Math.floor(Math.random() * 1000),
        };
    }
    async sendNotifications(routine, execution, success) {
        for (const notification of routine.notifications.channels) {
            try {
                switch (notification.type) {
                    case 'email':
                        await this.sendEmailNotification(notification.target, execution, success);
                        break;
                    case 'slack':
                        await this.sendSlackNotification(notification.target, execution, success);
                        break;
                    case 'webhook':
                        await this.sendWebhookNotification(notification.target, execution, success);
                        break;
                    case 'sms':
                        await this.sendSmsNotification(notification.target, execution, success);
                        break;
                }
            }
            catch (error) {
                this.logger.error(`Failed to send ${notification.type} notification: ${error.message}`);
            }
        }
    }
    async sendEmailNotification(target, execution, success) {
        this.logger.log(`Sending email notification to ${target} for routine ${execution.routineName}`);
    }
    async sendSlackNotification(target, execution, success) {
        this.logger.log(`Sending Slack notification to ${target} for routine ${execution.routineName}`);
    }
    async sendWebhookNotification(target, execution, success) {
        this.logger.log(`Sending webhook notification to ${target} for routine ${execution.routineName}`);
    }
    async sendSmsNotification(target, execution, success) {
        this.logger.log(`Sending SMS notification to ${target} for routine ${execution.routineName}`);
    }
    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async getMaintenanceReport() {
        const startTime = Date.now();
        this.logger.log('Generating maintenance report');
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentExecutions = Array.from(this.executions.values()).filter(exec => exec.startTime >= twentyFourHoursAgo);
        const failedExecutions = recentExecutions.filter(exec => exec.status === 'failed');
        const successfulExecutions = recentExecutions.filter(exec => exec.status === 'completed');
        const backupHistory = Array.from(this.backups.values());
        const verifiedBackups = backupHistory.filter(backup => backup.status === 'verified').length;
        const createdBackups = backupHistory.filter(backup => backup.status === 'created').length;
        const recentHealth = this.healthHistory.filter(health => health.timestamp >= twentyFourHoursAgo);
        const duration = Date.now() - startTime;
        let overallStatus = 'healthy';
        if (failedExecutions.length > this.config.maintenanceMetrics.maxConsecutiveFailures) {
            overallStatus = 'unhealthy';
        }
        else if (failedExecutions.length > 0) {
            overallStatus = 'degraded';
        }
        const currentHealth = this.healthHistory.length > 0
            ? this.healthHistory[this.healthHistory.length - 1]
            : {
                timestamp: new Date(),
                metrics: { cpu: 0, memory: 0, disk: 0, responseTime: 0 },
                status: 'healthy',
                issues: [],
            };
        if (currentHealth.status === 'unhealthy') {
            overallStatus = 'unhealthy';
        }
        else if (currentHealth.status === 'degraded' && overallStatus === 'healthy') {
            overallStatus = 'degraded';
        }
        const report = {
            overallStatus,
            routinesExecuted: recentExecutions.length,
            routinesSuccessful: successfulExecutions.length,
            routinesFailed: failedExecutions.length,
            backupsCreated: createdBackups,
            backupsVerified: verifiedBackups,
            systemHealth: currentHealth,
            summary: {
                recentExecutions,
                failedRoutines: failedExecutions,
                backupHistory,
                healthHistory: recentHealth,
            },
            timestamp: new Date(),
            duration,
        };
        this.logger.log(`Maintenance report generated: ${overallStatus}`);
        return report;
    }
    getRoutineExecutionHistory(routineName, limit = 50) {
        const executions = Array.from(this.executions.values()).filter(exec => exec.routineName === routineName);
        return executions.slice(-limit);
    }
    getBackupHistory(limit = 50) {
        const backups = Array.from(this.backups.values());
        return backups.slice(-limit);
    }
    getHealthHistory(limit = 50) {
        return this.healthHistory.slice(-limit);
    }
    cancelRoutineExecution(executionId) {
        const execution = this.executions.get(executionId);
        if (execution && execution.status === 'running') {
            execution.status = 'cancelled';
            execution.endTime = new Date();
            this.executions.set(executionId, execution);
            this.logger.log(`Routine execution ${executionId} cancelled`);
        }
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(config) {
        this.config = { ...this.config, ...config };
        this.logger.log('Maintenance configuration updated');
    }
    addRoutine(routine) {
        this.config.routines.push(routine);
        this.logger.log(`Added routine ${routine.name}`);
    }
    removeRoutine(routineName) {
        this.config.routines = this.config.routines.filter(r => r.name !== routineName);
        this.logger.log(`Removed routine ${routineName}`);
    }
};
exports.MaintenanceProceduresService = MaintenanceProceduresService;
exports.MaintenanceProceduresService = MaintenanceProceduresService = MaintenanceProceduresService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], MaintenanceProceduresService);
//# sourceMappingURL=maintenance-procedures.service.js.map