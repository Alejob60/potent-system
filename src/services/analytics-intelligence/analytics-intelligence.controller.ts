import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { DataWarehouseService } from './data-warehouse.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { BusinessIntelligenceService } from './business-intelligence.service';
import { ReportingService } from './reporting.service';
import { RealTimeAnalyticsService } from './real-time-analytics.service';
import { ETLService } from './etl.service';
import { BatchProcessingService } from './batch-processing.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

// Define ExecutionResult interface
interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

@ApiTags('analytics-intelligence')
@Controller('analytics-intelligence')
export class AnalyticsIntelligenceController {
  private readonly logger = new Logger(AnalyticsIntelligenceController.name);

  constructor(
    private readonly dataWarehouseService: DataWarehouseService,
    private readonly predictiveAnalyticsService: PredictiveAnalyticsService,
    private readonly businessIntelligenceService: BusinessIntelligenceService,
    private readonly reportingService: ReportingService,
    private readonly realTimeAnalyticsService: RealTimeAnalyticsService,
    private readonly etlService: ETLService,
    private readonly batchProcessingService: BatchProcessingService,
  ) {}

  // DATA WAREHOUSE ENDPOINTS

  @Post('data-warehouse/initialize')
  @ApiOperation({
    summary: 'Initialize data warehouse',
    description: 'Initialize a new data warehouse with the specified configuration',
  })
  @ApiBody({
    description: 'Data warehouse configuration',
    schema: {
      type: 'object',
      properties: {
        dataSource: { type: 'string' },
        tableName: { type: 'string' },
        primaryKey: { type: 'string' },
        columns: { type: 'array', items: { type: 'string' } },
      },
      required: ['dataSource', 'tableName', 'primaryKey', 'columns'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data warehouse initialized successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  async initializeDataWarehouse(@Body() body: any) {
    try {
      if (!body.dataSource || !body.tableName || !body.primaryKey || !body.columns) {
        throw new BadRequestException('Missing required fields: dataSource, tableName, primaryKey, columns');
      }

      const success: boolean = await this.dataWarehouseService.initializeDataWarehouse({
        dataSource: body.dataSource,
        tableName: body.tableName,
        primaryKey: body.primaryKey,
        columns: body.columns,
      });

      return {
        success: true,
        data: success,
      };
    } catch (error) {
      this.logger.error(`Failed to initialize data warehouse: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('etl/process')
  @ApiOperation({
    summary: 'Execute ETL process',
    description: 'Execute an Extract, Transform, Load process with the specified configuration',
  })
  @ApiBody({
    description: 'ETL process configuration',
    schema: {
      type: 'object',
      properties: {
        source: { type: 'string' },
        destination: { type: 'string' },
        transformations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              transformation: { type: 'string' },
              parameters: { type: 'object' },
            },
            required: ['field', 'transformation'],
          },
        },
      },
      required: ['source', 'destination', 'transformations'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'ETL process executed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            extracted: { type: 'number' },
            transformed: { type: 'number' },
            loaded: { type: 'number' },
            errors: { type: 'number' },
            duration: { type: 'number' },
          },
        },
      },
    },
  })
  async executeETLProcess(@Body() body: any) {
    try {
      if (!body.source || !body.destination || !body.transformations) {
        throw new BadRequestException('Missing required fields: source, destination, transformations');
      }

      const result: any = await this.dataWarehouseService.executeETLProcess({
        source: body.source,
        destination: body.destination,
        transformations: body.transformations,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to execute ETL process: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('batch/process')
  @ApiOperation({
    summary: 'Process batch data',
    description: 'Process batch data with the specified configuration',
  })
  @ApiBody({
    description: 'Batch process configuration',
    schema: {
      type: 'object',
      properties: {
        schedule: { type: 'string' },
        batchSize: { type: 'number' },
        parallelProcessing: { type: 'boolean' },
      },
      required: ['schedule', 'batchSize', 'parallelProcessing'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Batch data processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            estimatedCompletion: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async processBatchData(@Body() body: any) {
    try {
      if (!body.schedule || body.batchSize === undefined || body.parallelProcessing === undefined) {
        throw new BadRequestException('Missing required fields: schedule, batchSize, parallelProcessing');
      }

      const result: any = await this.batchProcessingService.processBatchData({
        schedule: body.schedule,
        batchSize: body.batchSize,
        parallelProcessing: body.parallelProcessing,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to process batch data: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('batch/executions')
  @ApiOperation({
    summary: 'List batch executions',
    description: 'List batch job executions with optional filtering',
  })
  @ApiQuery({
    name: 'jobId',
    description: 'Filter by job ID',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit the number of results',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Batch executions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              executionId: { type: 'string' },
              jobId: { type: 'string' },
              status: { type: 'string', enum: ['queued', 'running', 'completed', 'failed', 'cancelled'] },
              startTime: { type: 'string', format: 'date-time' },
              endTime: { type: 'string', format: 'date-time' },
              duration: { type: 'number' },
              totalBatches: { type: 'number' },
              completedBatches: { type: 'number' },
              totalRecords: { type: 'number' },
              processedRecords: { type: 'number' },
              failedRecords: { type: 'number' },
              retryCount: { type: 'number' },
              errorMessage: { type: 'string' },
              metrics: {
                type: 'object',
                properties: {
                  extracted: { type: 'number' },
                  transformed: { type: 'number' },
                  loaded: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  async listBatchExecutions(
    @Query('jobId') jobId?: string,
    @Query('limit') limit?: string
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const executions = this.batchProcessingService.listJobExecutions(jobId, limitNum);

      return {
        success: true,
        data: executions,
      };
    } catch (error) {
      this.logger.error(`Failed to list batch executions: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('batch/execution/:executionId/cancel')
  @ApiOperation({
    summary: 'Cancel batch execution',
    description: 'Cancel running batch job execution',
  })
  @ApiParam({
    name: 'executionId',
    description: 'Batch execution ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch execution cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  async cancelBatchExecution(@Param('executionId') executionId: string) {
    try {
      const success = this.batchProcessingService.cancelJobExecution(executionId);

      if (!success) {
        return {
          success: false,
          error: 'Batch execution not found or not running',
        };
      }

      return {
        success: true,
        data: success,
      };
    } catch (error) {
      this.logger.error(`Failed to cancel batch execution: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('batch/executions/:executionId')
  @ApiOperation({
    summary: 'Get batch execution',
    description: 'Get a specific batch job execution',
  })
  @ApiParam({
    name: 'executionId',
    description: 'The ID of the batch execution',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch execution retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            executionId: { type: 'string' },
            jobId: { type: 'string' },
            status: { type: 'string', enum: ['queued', 'running', 'completed', 'failed', 'cancelled'] },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            duration: { type: 'number' },
            totalBatches: { type: 'number' },
            completedBatches: { type: 'number' },
            totalRecords: { type: 'number' },
            processedRecords: { type: 'number' },
            failedRecords: { type: 'number' },
            retryCount: { type: 'number' },
            errorMessage: { type: 'string' },
            metrics: {
              type: 'object',
              properties: {
                extracted: { type: 'number' },
                transformed: { type: 'number' },
                loaded: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Batch execution not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        error: { type: 'string' },
      },
    },
  })
  async getBatchExecution(@Param('executionId') executionId: string) {
    try {
      const execution = this.batchProcessingService.getJobExecution(executionId);

      if (!execution) {
        return {
          success: false,
          error: 'Batch execution not found',
        };
      }

      return {
        success: true,
        data: execution,
      };
    } catch (error) {
      this.logger.error(`Failed to get batch execution: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('batch/execution/:executionId/retry')
  @ApiOperation({
    summary: 'Retry batch execution',
    description: 'Retry a failed batch job execution',
  })
  @ApiParam({
    name: 'executionId',
    description: 'Batch execution ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch execution retry initiated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            newExecutionId: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    },
  })
  async retryBatchExecution(@Param('executionId') executionId: string) {
    try {
      const result = this.batchProcessingService.retryJobExecution(executionId);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to retry batch execution: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // PREDICTIVE ANALYTICS ENDPOINTS

  @Post('predictive-analytics/train')
  @ApiOperation({
    summary: 'Train predictive model',
    description: 'Train a predictive model with the specified dataset and configuration',
  })
  @ApiBody({
    description: 'Model training configuration',
    schema: {
      type: 'object',
      properties: {
        dataset: { type: 'string' },
        algorithm: { type: 'string' },
        features: { type: 'array', items: { type: 'string' } },
        target: { type: 'string' },
        parameters: { type: 'object' },
      },
      required: ['dataset', 'algorithm', 'features', 'target'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Predictive model trained successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            modelId: { type: 'string' },
            accuracy: { type: 'number' },
            trainingTime: { type: 'number' },
            featureImportance: { type: 'object' },
          },
        },
      },
    },
  })
  async trainPredictiveModel(@Body() body: any) {
    try {
      if (!body.dataset || !body.algorithm || !body.features || !body.target) {
        throw new BadRequestException('Missing required fields: dataset, algorithm, features, target');
      }

      const result: any = await this.predictiveAnalyticsService.trainModel({
        dataset: body.dataset,
        algorithm: body.algorithm,
        features: body.features,
        target: body.target,
        parameters: body.parameters,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to train predictive model: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('predictive-analytics/predict')
  @ApiOperation({
    summary: 'Make predictions',
    description: 'Make predictions using a trained model',
  })
  @ApiBody({
    description: 'Prediction request',
    schema: {
      type: 'object',
      properties: {
        modelId: { type: 'string' },
        inputData: { type: 'array', items: { type: 'object' } },
      },
      required: ['modelId', 'inputData'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Predictions generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              prediction: { type: 'number' },
              confidence: { type: 'number' },
              explanation: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async makePredictions(@Body() body: any) {
    try {
      if (!body.modelId || !body.inputData) {
        throw new BadRequestException('Missing required fields: modelId, inputData');
      }

      const predictions: any[] = await this.predictiveAnalyticsService.makePredictions({
        modelId: body.modelId,
        inputData: body.inputData,
      });

      return {
        success: true,
        data: predictions,
      };
    } catch (error) {
      this.logger.error(`Failed to make predictions: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // BUSINESS INTELLIGENCE ENDPOINTS

  @Post('bi/dashboard')
  @ApiOperation({
    summary: 'Create BI dashboard',
    description: 'Create a new business intelligence dashboard',
  })
  @ApiBody({
    description: 'Dashboard configuration',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        widgets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              title: { type: 'string' },
              dataSource: { type: 'string' },
              query: { type: 'string' },
              visualization: { type: 'string' },
            },
            required: ['type', 'title', 'dataSource', 'query', 'visualization'],
          },
        },
      },
      required: ['name', 'widgets'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'BI dashboard created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            dashboardId: { type: 'string' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async createDashboard(@Body() body: any) {
    try {
      if (!body.name || !body.widgets) {
        throw new BadRequestException('Missing required fields: name, widgets');
      }

      const dashboard: any = await this.businessIntelligenceService.createDashboard({
        name: body.name,
        description: body.description,
        widgets: body.widgets,
      });

      return {
        success: true,
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Failed to create dashboard: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('bi/dashboard/:dashboardId')
  @ApiOperation({
    summary: 'Get BI dashboard',
    description: 'Get a specific business intelligence dashboard',
  })
  @ApiParam({
    name: 'dashboardId',
    description: 'The ID of the dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'BI dashboard retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            dashboardId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            widgets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  widgetId: { type: 'string' },
                  type: { type: 'string' },
                  title: { type: 'string' },
                  dataSource: { type: 'string' },
                  query: { type: 'string' },
                  visualization: { type: 'string' },
                  data: { type: 'array', items: { type: 'object' } },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getDashboard(@Param('dashboardId') dashboardId: string) {
    try {
      const dashboard = this.businessIntelligenceService.getDashboard(dashboardId);

      if (!dashboard) {
        return {
          success: false,
          error: 'Dashboard not found',
        };
      }

      return {
        success: true,
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // REPORTING ENDPOINTS

  @Post('reports/generate')
  @ApiOperation({
    summary: 'Generate report',
    description: 'Generate a new report based on template and parameters',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        template: { type: 'string' },
        parameters: { type: 'object' },
        format: { type: 'string', enum: ['pdf', 'csv', 'xlsx', 'json'] },
        recipients: { type: 'array', items: { type: 'string' } },
      },
      required: ['template', 'parameters', 'format'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            templateId: { type: 'string' },
            name: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
            parameters: { type: 'object' },
            format: { type: 'string' },
            dataSize: { type: 'number' },
            pages: { type: 'number' },
            downloadUrl: { type: 'string' },
          },
        },
      },
    },
  })
  async generateReport(@Body() body: any) {
    try {
      if (!body.template || !body.parameters || !body.format) {
        throw new BadRequestException('Missing required fields: template, parameters, format');
      }

      // Corregimos la llamada al método generateReport pasando los parámetros correctamente
      const report: any = await this.reportingService.generateReport(
        body.template, 
        body.parameters
      );

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`Failed to generate report: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('reports/:reportId')
  @ApiOperation({
    summary: 'Get report',
    description: 'Get a specific report',
  })
  @ApiParam({
    name: 'reportId',
    description: 'The ID of the report',
  })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            reportId: { type: 'string' },
            template: { type: 'string' },
            parameters: { type: 'object' },
            format: { type: 'string' },
            fileName: { type: 'string' },
            fileSize: { type: 'number' },
            url: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
            recipients: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  async getReport(@Param('reportId') reportId: string) {
    try {
      const report = this.reportingService.getReport(reportId);

      if (!report) {
        return {
          success: false,
          error: 'Report not found',
        };
      }

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`Failed to get report: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // REAL-TIME ANALYTICS ENDPOINTS

  @Get('real-time/metrics')
  @ApiOperation({
    summary: 'Get real-time metrics',
    description: 'Get current real-time analytics metrics',
  })
  @ApiQuery({
    name: 'metricNames',
    description: 'Comma-separated list of metric names to retrieve',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Real-time metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              value: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
              trend: { type: 'string', enum: ['up', 'down', 'stable'] },
            },
          },
        },
      },
    },
  })
  async getRealTimeMetrics(@Query('metricNames') metricNames?: string) {
    try {
      // Corregimos el paso de parámetros a getCurrentMetrics
      const names: string[] = metricNames ? metricNames.split(',') : [];
      const metrics = this.realTimeAnalyticsService.getCurrentMetrics(names);

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error(`Failed to get real-time metrics: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('real-time/alerts')
  @ApiOperation({
    summary: 'Get real-time alerts',
    description: 'Get current active real-time alerts',
  })
  @ApiResponse({
    status: 200,
    description: 'Real-time alerts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              alertId: { type: 'string' },
              metric: { type: 'string' },
              threshold: { type: 'number' },
              currentValue: { type: 'number' },
              triggeredAt: { type: 'string', format: 'date-time' },
              severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              message: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getRealTimeAlerts() {
    try {
      const alerts = this.realTimeAnalyticsService.getActiveAlerts();

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      this.logger.error(`Failed to get real-time alerts: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}