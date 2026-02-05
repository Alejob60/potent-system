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
var BatchProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessingService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const data_warehouse_service_1 = require("./data-warehouse.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
let BatchProcessingService = BatchProcessingService_1 = class BatchProcessingService {
    constructor(dataWarehouseService, websocketGateway) {
        this.dataWarehouseService = dataWarehouseService;
        this.websocketGateway = websocketGateway;
        this.logger = new common_1.Logger(BatchProcessingService_1.name);
        this.jobExecutionStream = new rxjs_1.Subject();
        this.batchJobs = new Map();
        this.jobExecutions = new Map();
        this.executionHistory = [];
    }
    createBatchJob(config) {
        this.batchJobs.set(config.jobId, config);
        this.logger.log(`Created batch job: ${config.jobId} - ${config.name}`);
        return config.jobId;
    }
    getBatchJob(jobId) {
        return this.batchJobs.get(jobId);
    }
    listBatchJobs() {
        return Array.from(this.batchJobs.values());
    }
    updateBatchJob(jobId, config) {
        if (!this.batchJobs.has(jobId)) {
            return false;
        }
        const existingConfig = this.batchJobs.get(jobId);
        const updatedConfig = { ...existingConfig, ...config };
        this.batchJobs.set(jobId, updatedConfig);
        this.logger.log(`Updated batch job: ${jobId}`);
        return true;
    }
    deleteBatchJob(jobId) {
        const result = this.batchJobs.delete(jobId);
        if (result) {
            this.logger.log(`Deleted batch job: ${jobId}`);
        }
        return result;
    }
    async executeBatchJob(jobId) {
        const job = this.batchJobs.get(jobId);
        if (!job) {
            throw new Error(`Batch job not found: ${jobId}`);
        }
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = new Date();
        const execution = {
            executionId,
            jobId,
            status: 'running',
            startTime,
            totalBatches: 5,
            completedBatches: 0,
            totalRecords: 5000,
            processedRecords: 0,
            failedRecords: 0,
            retryCount: 0,
            metrics: {
                extracted: 0,
                transformed: 0,
                loaded: 0,
            },
        };
        this.jobExecutions.set(executionId, execution);
        this.jobExecutionStream.next(execution);
        try {
            this.logger.log(`Starting batch job execution: ${executionId} for job ${jobId}`);
            await this.simulateBatchProcess(job, execution);
            execution.status = 'completed';
            execution.endTime = new Date();
            execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
            this.logger.log(`Completed batch job execution: ${executionId} - Processed ${execution.processedRecords} records`);
            this.executionHistory.push(execution);
            if (this.executionHistory.length > 1000) {
                this.executionHistory.shift();
            }
            this.websocketGateway.server.emit('batch_job_completed', execution);
            return executionId;
        }
        catch (error) {
            execution.status = 'failed';
            execution.endTime = new Date();
            execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
            execution.errorMessage = error.message;
            this.logger.error(`Failed batch job execution: ${executionId} - ${error.message}`);
            this.websocketGateway.server.emit('batch_job_failed', execution);
            throw error;
        }
        finally {
            this.jobExecutions.set(executionId, execution);
            this.jobExecutionStream.next(execution);
        }
    }
    async simulateBatchProcess(job, execution) {
        for (let i = 1; i <= execution.totalBatches; i++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            execution.completedBatches = i;
            execution.processedRecords = i * 1000;
            execution.failedRecords = Math.floor(i * 2);
            execution.metrics.extracted = execution.processedRecords;
            execution.metrics.transformed = execution.processedRecords - execution.failedRecords;
            execution.metrics.loaded = execution.processedRecords - execution.failedRecords;
            this.jobExecutions.set(execution.executionId, { ...execution });
            this.jobExecutionStream.next({ ...execution });
        }
    }
    getJobExecution(executionId) {
        return this.jobExecutions.get(executionId);
    }
    listJobExecutions(jobId, limit = 50) {
        let executions = Array.from(this.jobExecutions.values());
        if (jobId) {
            executions = executions.filter(exec => exec.jobId === jobId);
        }
        return executions.slice(-limit);
    }
    getExecutionHistory(limit = 100) {
        return this.executionHistory.slice(-limit);
    }
    cancelJobExecution(executionId) {
        const execution = this.jobExecutions.get(executionId);
        if (!execution || execution.status !== 'running') {
            return false;
        }
        execution.status = 'cancelled';
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
        this.jobExecutions.set(executionId, execution);
        this.jobExecutionStream.next(execution);
        this.logger.log(`Cancelled batch job execution: ${executionId}`);
        this.websocketGateway.server.emit('batch_job_cancelled', execution);
        return true;
    }
    getJobExecutionStream() {
        return this.jobExecutionStream.asObservable();
    }
    validateBatchJobConfig(config) {
        if (!config.jobId || !config.name || !config.source || !config.destination) {
            return false;
        }
        if (!config.source.type || !config.source.connection) {
            return false;
        }
        if (!config.destination.type || !config.destination.connection) {
            return false;
        }
        if (!config.batchSize || config.batchSize <= 0) {
            return false;
        }
        return true;
    }
    async retryJobExecution(executionId) {
        const execution = this.jobExecutions.get(executionId);
        if (!execution) {
            throw new Error(`Execution not found: ${executionId}`);
        }
        const job = this.batchJobs.get(execution.jobId);
        if (!job) {
            throw new Error(`Batch job not found: ${execution.jobId}`);
        }
        execution.retryCount++;
        if (execution.retryCount > (job.maxRetries || 3)) {
            execution.status = 'failed';
            execution.errorMessage = 'Max retries exceeded';
            this.jobExecutions.set(executionId, execution);
            throw new Error('Max retries exceeded');
        }
        const retryDelay = job.retryDelay || 1000;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.executeBatchJob(execution.jobId);
    }
    async processBatchData(config) {
        try {
            this.logger.log(`Processing batch data with config: ${JSON.stringify(config)}`);
            const mockResult = {
                jobId: `job_${Date.now()}`,
                status: 'started',
                startTime: new Date().toISOString(),
                estimatedCompletion: new Date(Date.now() + 300000).toISOString(),
            };
            this.logger.log(`Batch data processing initiated: ${JSON.stringify(mockResult)}`);
            return mockResult;
        }
        catch (error) {
            this.logger.error(`Failed to process batch data: ${error.message}`);
            throw error;
        }
    }
};
exports.BatchProcessingService = BatchProcessingService;
exports.BatchProcessingService = BatchProcessingService = BatchProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_warehouse_service_1.DataWarehouseService,
        websocket_gateway_1.WebSocketGatewayService])
], BatchProcessingService);
//# sourceMappingURL=batch-processing.service.js.map