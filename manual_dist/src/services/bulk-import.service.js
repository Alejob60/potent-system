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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BulkImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../entities/customer.entity");
const import_job_entity_1 = require("../entities/import-job.entity");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs = __importStar(require("fs"));
let BulkImportService = BulkImportService_1 = class BulkImportService {
    constructor(customerRepository, importJobRepository) {
        this.customerRepository = customerRepository;
        this.importJobRepository = importJobRepository;
        this.logger = new common_1.Logger(BulkImportService_1.name);
    }
    async startImportJob(instanceId, fileName, filePath, columnMapping) {
        try {
            const importJob = this.importJobRepository.create({
                instance_id: instanceId,
                file_name: fileName,
                column_mapping: columnMapping,
                status: 'pending',
                total_rows: 0,
                processed_rows: 0,
                failed_rows: 0,
            });
            const savedJob = await this.importJobRepository.save(importJob);
            this.processImportFile(savedJob, filePath);
            return savedJob;
        }
        catch (error) {
            this.logger.error(`Failed to start import job: ${error.message}`);
            throw error;
        }
    }
    async processImportFile(job, filePath) {
        try {
            await this.importJobRepository.update(job.id, { status: 'processing' });
            const customers = [];
            const validationErrors = [];
            let totalRows = 0;
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)())
                    .on('data', (row) => {
                    totalRows++;
                    try {
                        const mappedRow = {};
                        for (const [sourceColumn, targetColumn] of Object.entries(job.column_mapping)) {
                            if (row[sourceColumn] !== undefined) {
                                mappedRow[targetColumn] = row[sourceColumn];
                            }
                        }
                        if (!mappedRow.name) {
                            validationErrors.push({
                                row_number: totalRows,
                                error: 'Name is required',
                                data: row,
                            });
                            return;
                        }
                        if (mappedRow.email && !this.isValidEmail(mappedRow.email)) {
                            validationErrors.push({
                                row_number: totalRows,
                                error: 'Invalid email format',
                                data: row,
                            });
                            return;
                        }
                        customers.push({
                            name: mappedRow.name,
                            email: mappedRow.email,
                            phone: mappedRow.phone,
                            meta: mappedRow,
                        });
                    }
                    catch (error) {
                        validationErrors.push({
                            row_number: totalRows,
                            error: error.message,
                            data: row,
                        });
                    }
                })
                    .on('end', () => {
                    resolve();
                })
                    .on('error', (error) => {
                    reject(error);
                });
            });
            await this.importJobRepository.update(job.id, { total_rows: totalRows });
            let processedRows = 0;
            let failedRows = validationErrors.length;
            for (const customerData of customers) {
                try {
                    const existingCustomer = await this.customerRepository.findOne({
                        where: {
                            instance_id: job.instance_id,
                            email: customerData.email,
                        },
                    });
                    if (existingCustomer) {
                        await this.customerRepository.update(existingCustomer.id, {
                            name: customerData.name,
                            phone: customerData.phone,
                            meta: {
                                ...existingCustomer.meta,
                                ...customerData.meta,
                            },
                            updated_at: new Date(),
                        });
                    }
                    else {
                        const customer = this.customerRepository.create({
                            instance_id: job.instance_id,
                            name: customerData.name,
                            email: customerData.email,
                            phone: customerData.phone,
                            meta: customerData.meta,
                        });
                        await this.customerRepository.save(customer);
                    }
                    processedRows++;
                }
                catch (error) {
                    failedRows++;
                    validationErrors.push({
                        row_number: processedRows + failedRows,
                        error: error.message,
                        data: customerData,
                    });
                }
            }
            await this.importJobRepository.update(job.id, {
                status: 'completed',
                processed_rows: processedRows,
                failed_rows: failedRows,
            });
            fs.unlinkSync(filePath);
            this.logger.log(`Import job ${job.id} completed. Processed: ${processedRows}, Failed: ${failedRows}`);
        }
        catch (error) {
            this.logger.error(`Failed to process import file for job ${job.id}: ${error.message}`);
            await this.importJobRepository.update(job.id, {
                status: 'failed',
                error: error.message,
            });
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
    async getImportJobStatus(jobId) {
        try {
            const job = await this.importJobRepository.findOne({
                where: { id: jobId },
            });
            if (!job) {
                throw new Error(`Import job ${jobId} not found`);
            }
            return job;
        }
        catch (error) {
            this.logger.error(`Failed to get import job status: ${error.message}`);
            throw error;
        }
    }
    async getImportJobDetail(jobId) {
        try {
            const job = await this.importJobRepository.findOne({
                where: { id: jobId },
            });
            if (!job) {
                throw new Error(`Import job ${jobId} not found`);
            }
            return {
                ...job,
                validation_errors: [],
            };
        }
        catch (error) {
            this.logger.error(`Failed to get import job detail: ${error.message}`);
            throw error;
        }
    }
    async cancelImportJob(jobId) {
        try {
            const job = await this.importJobRepository.findOne({
                where: { id: jobId },
            });
            if (!job) {
                throw new Error(`Import job ${jobId} not found`);
            }
            if (job.status !== 'processing' && job.status !== 'pending') {
                throw new Error(`Cannot cancel job in ${job.status} status`);
            }
            const updatedJob = await this.importJobRepository.save({
                ...job,
                status: 'failed',
                error: 'Job canceled by user',
            });
            return updatedJob;
        }
        catch (error) {
            this.logger.error(`Failed to cancel import job: ${error.message}`);
            throw error;
        }
    }
    async retryImportJob(jobId) {
        try {
            const job = await this.importJobRepository.findOne({
                where: { id: jobId },
            });
            if (!job) {
                throw new Error(`Import job ${jobId} not found`);
            }
            if (job.status !== 'failed') {
                throw new Error(`Cannot retry job in ${job.status} status`);
            }
            const updatedJob = await this.importJobRepository.save({
                ...job,
                status: 'pending',
                processed_rows: 0,
                failed_rows: 0,
                error: null,
                updated_at: new Date(),
            });
            return updatedJob;
        }
        catch (error) {
            this.logger.error(`Failed to retry import job: ${error.message}`);
            throw error;
        }
    }
    async previewCsvFile(filePath, limit = 5) {
        try {
            const previewData = [];
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe((0, csv_parser_1.default)())
                    .on('data', (row) => {
                    if (previewData.length < limit) {
                        previewData.push(row);
                    }
                })
                    .on('end', () => {
                    resolve();
                })
                    .on('error', (error) => {
                    reject(error);
                });
            });
            return previewData;
        }
        catch (error) {
            this.logger.error(`Failed to preview CSV file: ${error.message}`);
            throw error;
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};
exports.BulkImportService = BulkImportService;
exports.BulkImportService = BulkImportService = BulkImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(import_job_entity_1.ImportJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BulkImportService);
//# sourceMappingURL=bulk-import.service.js.map