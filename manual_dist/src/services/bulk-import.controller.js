"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BulkImportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const bulk_import_service_1 = require("./bulk-import.service");
const swagger_1 = require("@nestjs/swagger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const multer_1 = require("multer");
let BulkImportController = BulkImportController_1 = class BulkImportController {
    constructor(bulkImportService) {
        this.bulkImportService = bulkImportService;
        this.logger = new common_1.Logger(BulkImportController_1.name);
    }
    async startImportJob(file, instanceId, columnMapping) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('File is required');
            }
            if (!instanceId) {
                throw new common_1.BadRequestException('Instance ID is required');
            }
            if (!columnMapping) {
                throw new common_1.BadRequestException('Column mapping is required');
            }
            const job = await this.bulkImportService.startImportJob(instanceId, file.originalname, file.path, columnMapping);
            return {
                success: true,
                data: job,
            };
        }
        catch (error) {
            this.logger.error(`Failed to start import job: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getImportJobStatus(jobId) {
        try {
            const job = await this.bulkImportService.getImportJobStatus(jobId);
            return {
                success: true,
                data: job,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get import job status: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getImportJobDetail(jobId) {
        try {
            const detail = await this.bulkImportService.getImportJobDetail(jobId);
            return {
                success: true,
                data: detail,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get import job detail: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async cancelImportJob(jobId) {
        try {
            const job = await this.bulkImportService.cancelImportJob(jobId);
            return {
                success: true,
                data: job,
            };
        }
        catch (error) {
            this.logger.error(`Failed to cancel import job: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async retryImportJob(jobId) {
        try {
            const job = await this.bulkImportService.retryImportJob(jobId);
            return {
                success: true,
                data: job,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retry import job: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async previewCsvFile(file) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('File is required');
            }
            const previewData = await this.bulkImportService.previewCsvFile(file.path, 5);
            fs.unlinkSync(file.path);
            return {
                success: true,
                data: previewData,
            };
        }
        catch (error) {
            this.logger.error(`Failed to preview CSV file: ${error.message}`);
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.BulkImportController = BulkImportController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Start import job',
        description: 'Start a new bulk customer import job',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Import job parameters',
        schema: {
            type: 'object',
            properties: {
                instance_id: { type: 'string' },
                column_mapping: { type: 'object' },
                file: { type: 'string', format: 'binary' },
            },
            required: ['instance_id', 'column_mapping', 'file'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Import job started successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        instance_id: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                        total_rows: { type: 'number' },
                        processed_rows: { type: 'number' },
                        failed_rows: { type: 'number' },
                        file_name: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Only CSV files are allowed'), false);
            }
        },
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('instance_id')),
    __param(2, (0, common_1.Body)('column_mapping')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "startImportJob", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get job status',
        description: 'Get the status of an import job',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Job ID',
        example: 'job_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Job status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        instance_id: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                        total_rows: { type: 'number' },
                        processed_rows: { type: 'number' },
                        failed_rows: { type: 'number' },
                        file_name: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "getImportJobStatus", null);
__decorate([
    (0, common_1.Get)(':id/detail'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get detailed job info',
        description: 'Get detailed information about an import job including validation errors',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Job ID',
        example: 'job_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Detailed job info retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        instance_id: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                        total_rows: { type: 'number' },
                        processed_rows: { type: 'number' },
                        failed_rows: { type: 'number' },
                        file_name: { type: 'string' },
                        column_mapping: { type: 'object' },
                        error: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        validation_errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    row_number: { type: 'number' },
                                    error: { type: 'string' },
                                    data: { type: 'object' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "getImportJobDetail", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel job',
        description: 'Cancel an ongoing import job',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Job ID',
        example: 'job_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Job canceled successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        instance_id: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                        total_rows: { type: 'number' },
                        processed_rows: { type: 'number' },
                        failed_rows: { type: 'number' },
                        file_name: { type: 'string' },
                        error: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "cancelImportJob", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, swagger_1.ApiOperation)({
        summary: 'Retry failed job',
        description: 'Retry a failed import job',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Job ID',
        example: 'job_1234567890',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Job retry initiated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        instance_id: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                        total_rows: { type: 'number' },
                        processed_rows: { type: 'number' },
                        failed_rows: { type: 'number' },
                        file_name: { type: 'string' },
                        error: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "retryImportJob", null);
__decorate([
    (0, common_1.Post)('preview'),
    (0, swagger_1.ApiOperation)({
        summary: 'Preview CSV file',
        description: 'Preview the first few rows of a CSV file',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'CSV file to preview',
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'CSV preview retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Only CSV files are allowed'), false);
            }
        },
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BulkImportController.prototype, "previewCsvFile", null);
exports.BulkImportController = BulkImportController = BulkImportController_1 = __decorate([
    (0, swagger_1.ApiTags)('bulk-import'),
    (0, common_1.Controller)('imports'),
    __metadata("design:paramtypes", [bulk_import_service_1.BulkImportService])
], BulkImportController);
//# sourceMappingURL=bulk-import.controller.js.map