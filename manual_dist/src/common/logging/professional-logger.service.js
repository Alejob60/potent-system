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
var ProfessionalLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalLoggerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const professional_log_entity_1 = require("../../entities/professional-log.entity");
let ProfessionalLoggerService = ProfessionalLoggerService_1 = class ProfessionalLoggerService {
    constructor(logRepository) {
        this.logRepository = logRepository;
        this.logger = new common_1.Logger(ProfessionalLoggerService_1.name);
    }
    async log(logData) {
        try {
            const log = new professional_log_entity_1.ProfessionalLog();
            log.category = logData.category;
            log.action = logData.action;
            log.userId = logData.userId ?? '';
            log.productId = logData.productId ?? '';
            log.reference = logData.reference ?? '';
            log.message = logData.message ?? '';
            log.metadata = logData.metadata;
            log.timestamp = logData.timestamp;
            await this.logRepository.save(log);
            this.logger.log(`[${logData.category}] ${logData.action}`, {
                userId: logData.userId,
                productId: logData.productId,
                reference: logData.reference,
                message: logData.message,
                metadata: logData.metadata
            });
        }
        catch (error) {
            this.logger.error(`Error al registrar log profesional: ${error.message}`, error.stack);
        }
    }
    async getLogsByCategory(category, limit = 100) {
        try {
            return await this.logRepository.find({
                where: { category },
                order: { timestamp: 'DESC' },
                take: limit
            });
        }
        catch (error) {
            this.logger.error(`Error al obtener logs por categoría: ${error.message}`, error.stack);
            return [];
        }
    }
    async getLogsByTimeRange(startTime, endTime, limit = 100) {
        try {
            return await this.logRepository.find({
                where: {
                    timestamp: (0, typeorm_1.Between)(startTime, endTime)
                },
                order: { timestamp: 'DESC' },
                take: limit
            });
        }
        catch (error) {
            this.logger.error(`Error al obtener logs por rango de tiempo: ${error.message}`, error.stack);
            return [];
        }
    }
};
exports.ProfessionalLoggerService = ProfessionalLoggerService;
exports.ProfessionalLoggerService = ProfessionalLoggerService = ProfessionalLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(professional_log_entity_1.ProfessionalLog)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], ProfessionalLoggerService);
//# sourceMappingURL=professional-logger.service.js.map