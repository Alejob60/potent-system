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
var ETLService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETLService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const data_warehouse_service_1 = require("./data-warehouse.service");
const websocket_gateway_1 = require("../../websocket/websocket.gateway");
let ETLService = ETLService_1 = class ETLService {
    constructor(dataWarehouseService, websocketGateway) {
        this.dataWarehouseService = dataWarehouseService;
        this.websocketGateway = websocketGateway;
        this.logger = new common_1.Logger(ETLService_1.name);
        this.jobExecutionStream = new rxjs_1.Subject();
        this.etlJobs = new Map();
        this.jobExecutions = new Map();
        this.executionHistory = [];
    }
    createETLJob(config) {
        this.etlJobs.set(config.jobId, config);
        this.logger.log(`Created ETL job: ${config.jobId} - ${config.name}`);
        return config.jobId;
    }
    getETLJob(jobId) {
        return this.etlJobs.get(jobId);
    }
    listETLJobs() {
        return Array.from(this.etlJobs.values());
    }
    updateETLJob(jobId, config) {
        if (!this.etlJobs.has(jobId)) {
            return false;
        }
        const existingConfig = this.etlJobs.get(jobId);
        const updatedConfig = { ...existingConfig, ...config };
        this.etlJobs.set(jobId, updatedConfig);
        this.logger.log(`Updated ETL job: ${jobId}`);
        return true;
    }
    deleteETLJob(jobId) {
        const result = this.etlJobs.delete(jobId);
        if (result) {
            this.logger.log(`Deleted ETL job: ${jobId}`);
        }
        return result;
    }
    async executeETLJob(jobId) {
        const job = this.etlJobs.get(jobId);
        if (!job) {
            throw new Error(`ETL job not found: ${jobId}`);
        }
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = new Date();
        const execution = {
            executionId,
            jobId,
            status: 'running',
            startTime,
            recordsProcessed: 0,
            recordsFailed: 0,
            metrics: {
                extracted: 0,
                transformed: 0,
                loaded: 0,
            },
        };
        this.jobExecutions.set(executionId, execution);
        this.jobExecutionStream.next(execution);
        try {
            this.logger.log(`Starting ETL job execution: ${executionId} for job ${jobId}`);
            await this.simulateETLProcess(job, execution);
            execution.status = 'completed';
            execution.endTime = new Date();
            execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
            this.logger.log(`Completed ETL job execution: ${executionId} - Processed ${execution.recordsProcessed} records`);
            this.executionHistory.push(execution);
            if (this.executionHistory.length > 1000) {
                this.executionHistory.shift();
            }
            this.websocketGateway.server.emit('etl_job_completed', execution);
            return executionId;
        }
        catch (error) {
            execution.status = 'failed';
            execution.endTime = new Date();
            execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
            execution.errorMessage = error.message;
            this.logger.error(`Failed ETL job execution: ${executionId} - ${error.message}`);
            this.websocketGateway.server.emit('etl_job_failed', execution);
            throw error;
        }
        finally {
            this.jobExecutions.set(executionId, execution);
            this.jobExecutionStream.next(execution);
        }
    }
    async simulateETLProcess(job, execution) {
        await new Promise(resolve => setTimeout(resolve, 300));
        execution.metrics.extracted = 1000;
        execution.recordsProcessed = 1000;
        await new Promise(resolve => setTimeout(resolve, 500));
        execution.metrics.transformed = 995;
        await new Promise(resolve => setTimeout(resolve, 200));
        execution.metrics.loaded = 995;
        execution.recordsFailed = 5;
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
        this.logger.log(`Cancelled ETL job execution: ${executionId}`);
        this.websocketGateway.server.emit('etl_job_cancelled', execution);
        return true;
    }
    getJobExecutionStream() {
        return this.jobExecutionStream.asObservable();
    }
    validateETLJobConfig(config) {
        if (!config.jobId || !config.name || !config.source || !config.destination) {
            return false;
        }
        if (!config.source.type || !config.source.connection) {
            return false;
        }
        if (!config.destination.type || !config.destination.connection) {
            return false;
        }
        if (config.transformations) {
            for (const transform of config.transformations) {
                if (!transform.id || !transform.name || !transform.type || !transform.config) {
                    return false;
                }
            }
        }
        return true;
    }
};
exports.ETLService = ETLService;
exports.ETLService = ETLService = ETLService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_warehouse_service_1.DataWarehouseService,
        websocket_gateway_1.WebSocketGatewayService])
], ETLService);
//# sourceMappingURL=etl.service.js.map