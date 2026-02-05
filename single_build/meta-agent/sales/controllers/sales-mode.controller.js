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
var SalesModeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sales_mode_service_1 = require("../sales-mode.service");
const intention_detection_service_1 = require("../intention-detection.service");
const activate_sales_mode_dto_1 = require("../dtos/activate-sales-mode.dto");
const process_message_dto_1 = require("../dtos/process-message.dto");
const generate_payment_link_dto_1 = require("../dtos/generate-payment-link.dto");
const request_channel_transfer_dto_1 = require("../dtos/request-channel-transfer.dto");
let SalesModeController = SalesModeController_1 = class SalesModeController {
    salesModeService;
    intentionDetectionService;
    logger = new common_1.Logger(SalesModeController_1.name);
    constructor(salesModeService, intentionDetectionService) {
        this.salesModeService = salesModeService;
        this.intentionDetectionService = intentionDetectionService;
    }
    async activateSalesMode(dto) {
        this.logger.log('Activating sales mode', { tenantId: dto.tenantId });
        try {
            const result = await this.salesModeService.activateSalesMode(dto.tenantId);
            if (result) {
                return {
                    success: true,
                    message: 'Sales mode activated successfully',
                    tenantId: dto.tenantId
                };
            }
            else {
                return {
                    success: false,
                    error: 'Failed to activate sales mode'
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to activate sales mode', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async processMessage(dto) {
        this.logger.log('Processing message', {
            tenantId: dto.tenantId,
            messageLength: dto.message.length
        });
        try {
            const result = await this.intentionDetectionService.processMessage(dto.tenantId, dto.message);
            // Generate appropriate response based on detected intention
            const response = await this.intentionDetectionService.generateResponse(dto.tenantId, result.intention);
            return {
                success: true,
                data: result,
                response: response
            };
        }
        catch (error) {
            this.logger.error('Failed to process message', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async generatePaymentLink(dto) {
        this.logger.log('Generating payment link', {
            tenantId: dto.tenantId,
            serviceId: dto.serviceId
        });
        try {
            const paymentLink = await this.salesModeService.generatePaymentLink(dto.tenantId, dto.serviceId);
            if (paymentLink) {
                return {
                    success: true,
                    paymentLink: paymentLink,
                    message: 'Payment link generated successfully'
                };
            }
            else {
                return {
                    success: false,
                    error: 'Failed to generate payment link'
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to generate payment link', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async requestChannelTransfer(dto) {
        this.logger.log('Requesting channel transfer', {
            tenantId: dto.tenantId,
            channel: dto.channel
        });
        try {
            const result = await this.salesModeService.requestChannelTransfer(dto.tenantId, dto.channel);
            if (result) {
                return {
                    success: true,
                    message: `Channel transfer to ${dto.channel} requested successfully`,
                    channel: dto.channel
                };
            }
            else {
                return {
                    success: false,
                    error: 'Failed to request channel transfer'
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to request channel transfer', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getSalesContext(tenantId) {
        this.logger.log('Getting sales context', { tenantId });
        try {
            const salesContext = await this.salesModeService.getSalesContext(tenantId);
            if (salesContext) {
                return {
                    success: true,
                    data: salesContext
                };
            }
            else {
                return {
                    success: false,
                    error: 'Sales context not found'
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to get sales context', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getServiceCatalog(tenantId) {
        this.logger.log('Getting service catalog', { tenantId });
        try {
            const serviceCatalog = await this.salesModeService.getServiceCatalog(tenantId);
            if (serviceCatalog) {
                return {
                    success: true,
                    data: serviceCatalog
                };
            }
            else {
                return {
                    success: false,
                    error: 'Service catalog not found'
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to get service catalog', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getSalesStrategies(tenantId) {
        this.logger.log('Getting sales strategies', { tenantId });
        try {
            const salesStrategies = await this.salesModeService.getSalesStrategies(tenantId);
            if (salesStrategies) {
                return {
                    success: true,
                    data: salesStrategies
                };
            }
            else {
                return {
                    success: false,
                    error: 'Sales strategies not found'
                };
            }
        }
        catch (error) {
            this.logger.error('Failed to get sales strategies', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
};
exports.SalesModeController = SalesModeController;
__decorate([
    (0, common_1.Post)('activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate sales mode for tenant' }),
    (0, swagger_1.ApiBody)({ type: () => activate_sales_mode_dto_1.ActivateSalesModeDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sales mode activated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [activate_sales_mode_dto_1.ActivateSalesModeDto]),
    __metadata("design:returntype", Promise)
], SalesModeController.prototype, "activateSalesMode", null);
__decorate([
    (0, common_1.Post)('process-message'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process user message and detect intention' }),
    (0, swagger_1.ApiBody)({ type: () => process_message_dto_1.ProcessMessageDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Message processed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        intention: { type: 'string', example: 'interest' },
                        servicesDetected: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['desarrollo-web']
                        },
                        contextSummary: { type: 'string', example: 'Current intent: interest...' },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_message_dto_1.ProcessMessageDto]),
    __metadata("design:returntype", Promise)
], SalesModeController.prototype, "processMessage", null);
__decorate([
    (0, common_1.Post)('payment-link'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate payment link for service' }),
    (0, swagger_1.ApiBody)({ type: () => generate_payment_link_dto_1.GeneratePaymentLinkDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment link generated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_payment_link_dto_1.GeneratePaymentLinkDto]),
    __metadata("design:returntype", Promise)
], SalesModeController.prototype, "generatePaymentLink", null);
__decorate([
    (0, common_1.Post)('transfer-channel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request channel transfer' }),
    (0, swagger_1.ApiBody)({ type: () => request_channel_transfer_dto_1.RequestChannelTransferDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Channel transfer requested successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_channel_transfer_dto_1.RequestChannelTransferDto]),
    __metadata("design:returntype", Promise)
], SalesModeController.prototype, "requestChannelTransfer", null);
__decorate([
    (0, common_1.Get)('context/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales context for tenant' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sales context retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesModeController.prototype, "getSalesContext", null);
__decorate([
    (0, common_1.Get)('catalog/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get service catalog for tenant' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service catalog retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesModeController.prototype, "getServiceCatalog", null);
__decorate([
    (0, common_1.Get)('strategies/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales strategies for tenant' }),
    (0, swagger_1.ApiParam)({ name: 'tenantId', description: 'Tenant ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sales strategies retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesModeController.prototype, "getSalesStrategies", null);
exports.SalesModeController = SalesModeController = SalesModeController_1 = __decorate([
    (0, swagger_1.ApiTags)('Sales Mode'),
    (0, common_1.Controller)('api/meta-agent/sales'),
    __metadata("design:paramtypes", [sales_mode_service_1.SalesModeService,
        intention_detection_service_1.IntentionDetectionService])
], SalesModeController);
