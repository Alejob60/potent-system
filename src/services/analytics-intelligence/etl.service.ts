import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { DataWarehouseService } from './data-warehouse.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';

export interface ETLJobConfig {
  jobId: string;
  name: string;
  description?: string;
  source: {
    type: 'database' | 'api' | 'file' | 'stream';
    connection: string;
    query?: string;
    table?: string;
    endpoint?: string;
    filePath?: string;
  };
  transformations: Array<{
    id: string;
    name: string;
    type: 'field_mapping' | 'data_cleaning' | 'aggregation' | 'custom';
    config: any;
  }>;
  destination: {
    type: 'data_warehouse' | 'database' | 'file' | 'api';
    connection: string;
    table?: string;
    endpoint?: string;
    filePath?: string;
  };
  schedule?: string; // cron expression
  active: boolean;
}

export interface ETLJobExecution {
  executionId: string;
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
  metrics: {
    extracted: number;
    transformed: number;
    loaded: number;
  };
}

export interface ETLDataRecord {
  id: string;
  data: Record<string, any>;
  timestamp: Date;
  source: string;
}

@Injectable()
export class ETLService {
  private readonly logger = new Logger(ETLService.name);
  private readonly jobExecutionStream = new Subject<ETLJobExecution>();
  private etlJobs: Map<string, ETLJobConfig> = new Map();
  private jobExecutions: Map<string, ETLJobExecution> = new Map();
  private executionHistory: ETLJobExecution[] = [];

  constructor(
    private readonly dataWarehouseService: DataWarehouseService,
    private readonly websocketGateway: WebSocketGatewayService,
  ) {}

  /**
   * Create a new ETL job
   * @param config ETL job configuration
   * @returns Job ID
   */
  createETLJob(config: ETLJobConfig): string {
    this.etlJobs.set(config.jobId, config);
    this.logger.log(`Created ETL job: ${config.jobId} - ${config.name}`);
    return config.jobId;
  }

  /**
   * Get ETL job configuration
   * @param jobId Job ID
   * @returns ETL job configuration or undefined
   */
  getETLJob(jobId: string): ETLJobConfig | undefined {
    return this.etlJobs.get(jobId);
  }

  /**
   * List all ETL jobs
   * @returns Array of all ETL jobs
   */
  listETLJobs(): ETLJobConfig[] {
    return Array.from(this.etlJobs.values());
  }

  /**
   * Update ETL job configuration
   * @param jobId Job ID
   * @param config Updated configuration
   * @returns Boolean indicating success
   */
  updateETLJob(jobId: string, config: Partial<ETLJobConfig>): boolean {
    if (!this.etlJobs.has(jobId)) {
      return false;
    }
    
    const existingConfig = this.etlJobs.get(jobId);
    const updatedConfig = { ...existingConfig, ...config };
    this.etlJobs.set(jobId, updatedConfig as ETLJobConfig);
    
    this.logger.log(`Updated ETL job: ${jobId}`);
    return true;
  }

  /**
   * Delete ETL job
   * @param jobId Job ID
   * @returns Boolean indicating success
   */
  deleteETLJob(jobId: string): boolean {
    const result = this.etlJobs.delete(jobId);
    if (result) {
      this.logger.log(`Deleted ETL job: ${jobId}`);
    }
    return result;
  }

  /**
   * Execute ETL job
   * @param jobId Job ID
   * @returns Execution ID
   */
  async executeETLJob(jobId: string): Promise<string> {
    const job = this.etlJobs.get(jobId);
    if (!job) {
      throw new Error(`ETL job not found: ${jobId}`);
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();

    // Initialize execution tracking
    const execution: ETLJobExecution = {
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

      // Simulate ETL process
      await this.simulateETLProcess(job, execution);

      // Update execution status
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

      this.logger.log(`Completed ETL job execution: ${executionId} - Processed ${execution.recordsProcessed} records`);

      // Add to execution history
      this.executionHistory.push(execution);
      if (this.executionHistory.length > 1000) {
        this.executionHistory.shift();
      }

      // Broadcast completion via WebSocket
      this.websocketGateway.server.emit('etl_job_completed', execution);

      return executionId;
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.errorMessage = error.message;

      this.logger.error(`Failed ETL job execution: ${executionId} - ${error.message}`);

      // Broadcast failure via WebSocket
      this.websocketGateway.server.emit('etl_job_failed', execution);

      throw error;
    } finally {
      this.jobExecutions.set(executionId, execution);
      this.jobExecutionStream.next(execution);
    }
  }

  /**
   * Simulate ETL process for demonstration
   * @param job ETL job configuration
   * @param execution Execution tracking object
   */
  private async simulateETLProcess(job: ETLJobConfig, execution: ETLJobExecution): Promise<void> {
    // Simulate extraction
    await new Promise(resolve => setTimeout(resolve, 300));
    execution.metrics.extracted = 1000;
    execution.recordsProcessed = 1000;

    // Simulate transformation
    await new Promise(resolve => setTimeout(resolve, 500));
    execution.metrics.transformed = 995;

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 200));
    execution.metrics.loaded = 995;
    execution.recordsFailed = 5;
  }

  /**
   * Get job execution status
   * @param executionId Execution ID
   * @returns Execution status or undefined
   */
  getJobExecution(executionId: string): ETLJobExecution | undefined {
    return this.jobExecutions.get(executionId);
  }

  /**
   * List job executions
   * @param jobId Optional job ID to filter executions
   * @param limit Maximum number of executions to return
   * @returns Array of job executions
   */
  listJobExecutions(jobId?: string, limit: number = 50): ETLJobExecution[] {
    let executions = Array.from(this.jobExecutions.values());
    
    if (jobId) {
      executions = executions.filter(exec => exec.jobId === jobId);
    }
    
    return executions.slice(-limit);
  }

  /**
   * Get execution history
   * @param limit Maximum number of history items to return
   * @returns Array of execution history items
   */
  getExecutionHistory(limit: number = 100): ETLJobExecution[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Cancel job execution
   * @param executionId Execution ID
   * @returns Boolean indicating success
   */
  cancelJobExecution(executionId: string): boolean {
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

    // Broadcast cancellation via WebSocket
    this.websocketGateway.server.emit('etl_job_cancelled', execution);

    return true;
  }

  /**
   * Get job execution stream
   * @returns Observable of job executions
   */
  getJobExecutionStream(): Observable<ETLJobExecution> {
    return this.jobExecutionStream.asObservable();
  }

  /**
   * Validate ETL job configuration
   * @param config ETL job configuration
   * @returns Boolean indicating validity
   */
  validateETLJobConfig(config: ETLJobConfig): boolean {
    // Basic validation
    if (!config.jobId || !config.name || !config.source || !config.destination) {
      return false;
    }

    // Validate source configuration
    if (!config.source.type || !config.source.connection) {
      return false;
    }

    // Validate destination configuration
    if (!config.destination.type || !config.destination.connection) {
      return false;
    }

    // Validate transformations if present
    if (config.transformations) {
      for (const transform of config.transformations) {
        if (!transform.id || !transform.name || !transform.type || !transform.config) {
          return false;
        }
      }
    }

    return true;
  }
}