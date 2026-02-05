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
var LegalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const legal_document_entity_1 = require("../entities/legal-document.entity");
const consent_record_entity_1 = require("../entities/consent-record.entity");
const data_export_request_entity_1 = require("../entities/data-export-request.entity");
const data_delete_request_entity_1 = require("../entities/data-delete-request.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let LegalService = LegalService_1 = class LegalService {
    constructor(legalDocumentRepository, consentRecordRepository, dataExportRequestRepository, dataDeleteRequestRepository) {
        this.legalDocumentRepository = legalDocumentRepository;
        this.consentRecordRepository = consentRecordRepository;
        this.dataExportRequestRepository = dataExportRequestRepository;
        this.dataDeleteRequestRepository = dataDeleteRequestRepository;
        this.logger = new common_1.Logger(LegalService_1.name);
    }
    async getLegalDocumentByType(type) {
        try {
            const document = await this.legalDocumentRepository.findOne({
                where: { document_type: type },
                order: { created_at: 'DESC' },
            });
            if (!document) {
                throw new Error(`Legal document of type ${type} not found`);
            }
            return document;
        }
        catch (error) {
            this.logger.error(`Failed to get legal document: ${error.message}`);
            throw error;
        }
    }
    async recordConsent(userId, documentId, consented, ipAddress, userAgent) {
        try {
            let consentRecord = await this.consentRecordRepository.findOne({
                where: { user_id: userId, document_id: documentId },
            });
            if (consentRecord) {
                consentRecord.consented = consented;
                consentRecord.consented_at = new Date();
                if (ipAddress)
                    consentRecord.ip_address = ipAddress;
                if (userAgent)
                    consentRecord.user_agent = userAgent;
                consentRecord = await this.consentRecordRepository.save(consentRecord);
            }
            else {
                consentRecord = this.consentRecordRepository.create({
                    user_id: userId,
                    document_id: documentId,
                    consented,
                    consented_at: new Date(),
                    ip_address: ipAddress,
                    user_agent: userAgent,
                });
                consentRecord = await this.consentRecordRepository.save(consentRecord);
            }
            return consentRecord;
        }
        catch (error) {
            this.logger.error(`Failed to record consent: ${error.message}`);
            throw error;
        }
    }
    async checkConsentStatus(userId, documentId) {
        try {
            const consentRecord = await this.consentRecordRepository.findOne({
                where: { user_id: userId, document_id: documentId },
            });
            return consentRecord ? consentRecord.consented : false;
        }
        catch (error) {
            this.logger.error(`Failed to check consent status: ${error.message}`);
            throw error;
        }
    }
    async requestDataExport(requestData) {
        try {
            const exportRequest = this.dataExportRequestRepository.create({
                user_id: requestData.user_id,
                format: requestData.format,
                include_conversations: requestData.include_conversations,
                include_sales: requestData.include_sales,
                include_profile: requestData.include_profile,
                status: 'pending',
            });
            const savedRequest = await this.dataExportRequestRepository.save(exportRequest);
            this.processDataExport(savedRequest);
            return savedRequest;
        }
        catch (error) {
            this.logger.error(`Failed to request data export: ${error.message}`);
            throw error;
        }
    }
    async processDataExport(exportRequest) {
        try {
            await this.dataExportRequestRepository.update(exportRequest.id, {
                status: 'processing',
            });
            const exportData = {
                user_id: exportRequest.user_id,
                export_date: new Date().toISOString(),
                format: exportRequest.format,
                data: {
                    profile: exportRequest.include_profile ? this.getMockProfileData(exportRequest.user_id) : null,
                    conversations: exportRequest.include_conversations ? this.getMockConversationData(exportRequest.user_id) : null,
                    sales: exportRequest.include_sales ? this.getMockSalesData(exportRequest.user_id) : null,
                },
            };
            let fileName;
            let fileContent;
            switch (exportRequest.format) {
                case 'json':
                    fileName = `export_${exportRequest.user_id}_${Date.now()}.json`;
                    fileContent = JSON.stringify(exportData, null, 2);
                    break;
                case 'csv':
                    fileName = `export_${exportRequest.user_id}_${Date.now()}.csv`;
                    fileContent = this.convertToCSV(exportData);
                    break;
                case 'pdf':
                    fileName = `export_${exportRequest.user_id}_${Date.now()}.pdf`;
                    fileContent = this.convertToPDF(exportData);
                    break;
                default:
                    throw new Error('Unsupported format');
            }
            const filePath = path.join('./exports', fileName);
            fs.mkdirSync('./exports', { recursive: true });
            fs.writeFileSync(filePath, fileContent);
            const downloadUrl = `/api/users/data-export/download/${exportRequest.id}`;
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.dataExportRequestRepository.update(exportRequest.id, {
                status: 'completed',
                download_url: downloadUrl,
                expires_at: expiresAt,
            });
            this.logger.log(`Data export completed for user ${exportRequest.user_id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process data export: ${error.message}`);
            await this.dataExportRequestRepository.update(exportRequest.id, {
                status: 'failed',
                error_message: error.message,
            });
        }
    }
    async getDataExportStatus(requestId) {
        try {
            const exportRequest = await this.dataExportRequestRepository.findOne({
                where: { id: requestId },
            });
            if (!exportRequest) {
                throw new Error(`Data export request ${requestId} not found`);
            }
            return exportRequest;
        }
        catch (error) {
            this.logger.error(`Failed to get data export status: ${error.message}`);
            throw error;
        }
    }
    async requestDataDeletion(requestData) {
        try {
            const deleteRequest = this.dataDeleteRequestRepository.create({
                user_id: requestData.user_id,
                confirmation_code: requestData.confirmation_code,
                confirmed: false,
                processed: false,
            });
            const savedRequest = await this.dataDeleteRequestRepository.save(deleteRequest);
            return savedRequest;
        }
        catch (error) {
            this.logger.error(`Failed to request data deletion: ${error.message}`);
            throw error;
        }
    }
    async confirmDataDeletion(requestId, confirmationCode) {
        try {
            const deleteRequest = await this.dataDeleteRequestRepository.findOne({
                where: { id: requestId },
            });
            if (!deleteRequest) {
                throw new Error(`Data deletion request ${requestId} not found`);
            }
            if (deleteRequest.confirmation_code !== confirmationCode) {
                throw new Error('Invalid confirmation code');
            }
            deleteRequest.confirmed = true;
            const updatedRequest = await this.dataDeleteRequestRepository.save(deleteRequest);
            this.processDataDeletion(updatedRequest);
            return updatedRequest;
        }
        catch (error) {
            this.logger.error(`Failed to confirm data deletion: ${error.message}`);
            throw error;
        }
    }
    async processDataDeletion(deleteRequest) {
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.dataDeleteRequestRepository.update(deleteRequest.id, {
                processed: true,
            });
            this.logger.log(`Data deletion completed for user ${deleteRequest.user_id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process data deletion: ${error.message}`);
            await this.dataDeleteRequestRepository.update(deleteRequest.id, {
                error_message: error.message,
            });
        }
    }
    getMockProfileData(userId) {
        return {
            id: userId,
            name: 'John Doe',
            email: 'john.doe@example.com',
            created_at: '2023-01-01T00:00:00Z',
        };
    }
    getMockConversationData(userId) {
        return [
            {
                id: 'conv_1',
                user_id: userId,
                content: 'Hello, how can I help you?',
                timestamp: '2023-01-02T10:00:00Z',
            },
            {
                id: 'conv_2',
                user_id: userId,
                content: 'I need assistance with my account.',
                timestamp: '2023-01-02T10:05:00Z',
            },
        ];
    }
    getMockSalesData(userId) {
        return [
            {
                id: 'sale_1',
                user_id: userId,
                amount: 100.00,
                currency: 'USD',
                timestamp: '2023-01-03T14:30:00Z',
            },
        ];
    }
    convertToCSV(data) {
        return JSON.stringify(data, null, 2);
    }
    convertToPDF(data) {
        return JSON.stringify(data, null, 2);
    }
};
exports.LegalService = LegalService;
exports.LegalService = LegalService = LegalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(legal_document_entity_1.LegalDocument)),
    __param(1, (0, typeorm_1.InjectRepository)(consent_record_entity_1.ConsentRecord)),
    __param(2, (0, typeorm_1.InjectRepository)(data_export_request_entity_1.DataExportRequest)),
    __param(3, (0, typeorm_1.InjectRepository)(data_delete_request_entity_1.DataDeleteRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LegalService);
//# sourceMappingURL=legal.service.js.map