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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsIntelligenceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsIntelligenceController = void 0;
const common_1 = require("@nestjs/common");
const data_warehouse_service_1 = require("./data-warehouse.service");
const predictive_analytics_service_1 = require("./predictive-analytics.service");
const business_intelligence_service_1 = require("./business-intelligence.service");
const reporting_service_1 = require("./reporting.service");
const real_time_analytics_service_1 = require("./real-time-analytics.service");
const etl_service_1 = require("./etl.service");
const batch_processing_service_1 = require("./batch-processing.service");
const swagger_1 = require("@nestjs/swagger");
let AnalyticsIntelligenceController = AnalyticsIntelligenceController_1 = class AnalyticsIntelligenceController {
    constructor(dataWarehouseService, predictiveAnalyticsService, businessIntelligenceService, reportingService, realTimeAnalyticsService, etlService, batchProcessingService) {
        this.dataWarehouseService = dataWarehouseService;
        this.predictiveAnalyticsService = predictiveAnalyticsService;
        this.businessIntelligenceService = businessIntelligenceService;
        this.reportingService = reportingService;
        this.realTimeAnalyticsService = realTimeAnalyticsService;
        this.etlService = etlService;
        this.batchProcessingService = batchProcessingService;
        this.logger = new common_1.Logger(AnalyticsIntelligenceController_1.name);
    }
    async initializeDataWarehouse(body) {
        try {
            if (!body.dataSource || !body.tableName || !body.primaryKey || !body.columns) {
                throw new common_1.BadRequestException('Missing required fields: dataSource, tableName, primaryKey, columns');
            }
            const success = await this.dataWarehouseService.initializeDataWarehouse({
                dataSource: body.dataSource,
                tableName: body.tableName,
                primaryKey: body.primaryKey,
                columns: body.columns,
            });
            return {
                success: true,
                data: success,
            };
        }
        catch (error) {
            this.logger.error(`Failed to initialize data warehouse: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async executeETLProcess(body) {
        try {
            if (!body.source || !body.destination || !body.transformations) {
                throw new common_1.BadRequestException('Missing required fields: source, destination, transformations');
            }
            const result = await this.dataWarehouseService.executeETLProcess({
                source: body.source,
                destination: body.destination,
                transformations: body.transformations,
            });
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to execute ETL process: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async processBatchData(body) {
        try {
            if (!body.schedule || body.batchSize === undefined || body.parallelProcessing === undefined) {
                throw new common_1.BadRequestException('Missing required fields: schedule, batchSize, parallelProcessing');
            }
            const result = await this.batchProcessingService.processBatchData({
                schedule: body.schedule,
                batchSize: body.batchSize,
                parallelProcessing: body.parallelProcessing,
            });
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to process batch data: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async listBatchExecutions(jobId, limit) {
        try {
            const limitNum = limit ? parseInt(limit, 10) : 50;
            const executions = this.batchProcessingService.listJobExecutions(jobId, limitNum);
            return {
                success: true,
                data: executions,
            };
        }
        catch (error) {
            this.logger.error(`Failed to list batch executions: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async cancelBatchExecution(executionId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to cancel batch execution: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getBatchExecution(executionId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get batch execution: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async retryBatchExecution(executionId) {
        try {
            const result = this.batchProcessingService.retryJobExecution(executionId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retry batch execution: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async trainPredictiveModel(body) {
        try {
            if (!body.dataset || !body.algorithm || !body.features || !body.target) {
                throw new common_1.BadRequestException('Missing required fields: dataset, algorithm, features, target');
            }
            const result = await this.predictiveAnalyticsService.trainModel({
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
        }
        catch (error) {
            this.logger.error(`Failed to train predictive model: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async makePredictions(body) {
        try {
            if (!body.modelId || !body.inputData) {
                throw new common_1.BadRequestException('Missing required fields: modelId, inputData');
            }
            const predictions = await this.predictiveAnalyticsService.makePredictions({
                modelId: body.modelId,
                inputData: body.inputData,
            });
            return {
                success: true,
                data: predictions,
            };
        }
        catch (error) {
            this.logger.error(`Failed to make predictions: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async createDashboard(body) {
        try {
            if (!body.name || !body.widgets) {
                throw new common_1.BadRequestException('Missing required fields: name, widgets');
            }
            const dashboard = await this.businessIntelligenceService.createDashboard({
                name: body.name,
                description: body.description,
                widgets: body.widgets,
            });
            return {
                success: true,
                data: dashboard,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create dashboard: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getDashboard(dashboardId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get dashboard: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async generateReport(body) {
        try {
            if (!body.template || !body.parameters || !body.format) {
                throw new common_1.BadRequestException('Missing required fields: template, parameters, format');
            }
            const report = await this.reportingService.generateReport(body.template, body.parameters);
            return {
                success: true,
                data: report,
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate report: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getReport(reportId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get report: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getRealTimeMetrics(metricNames) {
        try {
            const names = metricNames ? metricNames.split(',') : [];
            const metrics = this.realTimeAnalyticsService.getCurrentMetrics(names);
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get real-time metrics: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getRealTimeAlerts() {
        try {
            const alerts = this.realTimeAnalyticsService.getActiveAlerts();
            return {
                success: true,
                data: alerts,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get real-time alerts: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.AnalyticsIntelligenceController = AnalyticsIntelligenceController;
__decorate([
    (0, common_1.Post)('data-warehouse/initialize'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initialize data warehouse',
        description: 'Initialize a new data warehouse with the specified configuration',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data warehouse initialized successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "initializeDataWarehouse", null);
__decorate([
    (0, common_1.Post)('etl/process'),
    (0, swagger_1.ApiOperation)({
        summary: 'Execute ETL process',
        description: 'Execute an Extract, Transform, Load process with the specified configuration',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "executeETLProcess", null);
__decorate([
    (0, common_1.Post)('batch/process'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process batch data',
        description: 'Process batch data with the specified configuration',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "processBatchData", null);
__decorate([
    (0, common_1.Get)('batch/executions'),
    (0, swagger_1.ApiOperation)({
        summary: 'List batch executions',
        description: 'List batch job executions with optional filtering',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'jobId',
        description: 'Filter by job ID',
        required: false,
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Limit the number of results',
        required: false,
        type: Number,
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Query)('jobId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "listBatchExecutions", null);
__decorate([
    (0, common_1.Post)('batch/execution/:executionId/cancel'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel batch execution',
        description: 'Cancel running batch job execution',
    }),
    (0, swagger_1.ApiParam)({
        name: 'executionId',
        description: 'Batch execution ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Batch execution cancelled successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "cancelBatchExecution", null);
__decorate([
    (0, common_1.Get)('batch/executions/:executionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get batch execution',
        description: 'Get a specific batch job execution',
    }),
    (0, swagger_1.ApiParam)({
        name: 'executionId',
        description: 'The ID of the batch execution',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Batch execution not found',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "getBatchExecution", null);
__decorate([
    (0, common_1.Post)('batch/execution/:executionId/retry'),
    (0, swagger_1.ApiOperation)({
        summary: 'Retry batch execution',
        description: 'Retry a failed batch job execution',
    }),
    (0, swagger_1.ApiParam)({
        name: 'executionId',
        description: 'Batch execution ID',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "retryBatchExecution", null);
__decorate([
    (0, common_1.Post)('predictive-analytics/train'),
    (0, swagger_1.ApiOperation)({
        summary: 'Train predictive model',
        description: 'Train a predictive model with the specified dataset and configuration',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "trainPredictiveModel", null);
__decorate([
    (0, common_1.Post)('predictive-analytics/predict'),
    (0, swagger_1.ApiOperation)({
        summary: 'Make predictions',
        description: 'Make predictions using a trained model',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Prediction request',
        schema: {
            type: 'object',
            properties: {
                modelId: { type: 'string' },
                inputData: { type: 'array', items: { type: 'object' } },
            },
            required: ['modelId', 'inputData'],
        },
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "makePredictions", null);
__decorate([
    (0, common_1.Post)('bi/dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create BI dashboard',
        description: 'Create a new business intelligence dashboard',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "createDashboard", null);
__decorate([
    (0, common_1.Get)('bi/dashboard/:dashboardId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get BI dashboard',
        description: 'Get a specific business intelligence dashboard',
    }),
    (0, swagger_1.ApiParam)({
        name: 'dashboardId',
        description: 'The ID of the dashboard',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('dashboardId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('reports/generate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate report',
        description: 'Generate a new report based on template and parameters',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('reports/:reportId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get report',
        description: 'Get a specific report',
    }),
    (0, swagger_1.ApiParam)({
        name: 'reportId',
        description: 'The ID of the report',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)('real-time/metrics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get real-time metrics',
        description: 'Get current real-time analytics metrics',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'metricNames',
        description: 'Comma-separated list of metric names to retrieve',
        required: false,
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Query)('metricNames')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "getRealTimeMetrics", null);
__decorate([
    (0, common_1.Get)('real-time/alerts'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get real-time alerts',
        description: 'Get current active real-time alerts',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsIntelligenceController.prototype, "getRealTimeAlerts", null);
exports.AnalyticsIntelligenceController = AnalyticsIntelligenceController = AnalyticsIntelligenceController_1 = __decorate([
    (0, swagger_1.ApiTags)('analytics-intelligence'),
    (0, common_1.Controller)('analytics-intelligence'),
    __metadata("design:paramtypes", [data_warehouse_service_1.DataWarehouseService,
        predictive_analytics_service_1.PredictiveAnalyticsService,
        business_intelligence_service_1.BusinessIntelligenceService,
        reporting_service_1.ReportingService,
        real_time_analytics_service_1.RealTimeAnalyticsService,
        etl_service_1.ETLService,
        batch_processing_service_1.BatchProcessingService])
], AnalyticsIntelligenceController);
//# sourceMappingURL=analytics-intelligence.controller.js.map