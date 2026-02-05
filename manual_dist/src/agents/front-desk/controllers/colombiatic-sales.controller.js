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
var ColombiaTicSalesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTicSalesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const front_desk_v2_service_1 = require("../services/front-desk-v2.service");
const front_desk_request_dto_1 = require("../dto/front-desk-request.dto");
let ColombiaTicSalesController = ColombiaTicSalesController_1 = class ColombiaTicSalesController {
    constructor(agentService) {
        this.agentService = agentService;
        this.logger = new common_1.Logger(ColombiaTicSalesController_1.name);
    }
    async create(req, dto) {
        this.logger.log('Received omnichannel customer service request', { dto });
        try {
            const enhancedDto = {
                ...dto,
                context: {
                    ...dto.context,
                    siteType: 'colombiatic',
                    origin: 'colombiatic.com',
                    websiteUrl: 'https://colombiatic.com',
                    products: dto.context?.products || [
                        'Desarrollo de Sitios Web',
                        'Tiendas Online',
                        'Aplicaciones Móviles',
                        'Marketing Digital',
                        'Consultoría Tecnológica'
                    ],
                    services: dto.context?.services || [
                        'Diseño Web Responsivo',
                        'Optimización SEO',
                        'Integración de Pasarelas de Pago',
                        'Soporte Técnico 24/7',
                        'Mantenimiento de Sitios Web'
                    ],
                },
                tenantContext: dto.tenantContext ? {
                    ...dto.tenantContext,
                    siteType: 'colombiatic',
                    origin: 'colombiatic.com',
                    websiteUrl: 'https://colombiatic.com',
                    products: dto.tenantContext.products || [
                        'Desarrollo de Sitios Web',
                        'Tiendas Online',
                        'Aplicaciones Móviles',
                        'Marketing Digital',
                        'Consultoría Tecnológica'
                    ],
                    services: dto.tenantContext.services || [
                        'Diseño Web Responsivo',
                        'Optimización SEO',
                        'Integración de Pasarelas de Pago',
                        'Soporte Técnico 24/7',
                        'Mantenimiento de Sitios Web'
                    ],
                } : {
                    tenantId: 'colombiatic-default',
                    siteId: 'colombiatic-site',
                    origin: 'colombiatic.com',
                    permissions: ['read', 'write'],
                    siteType: 'colombiatic',
                    websiteUrl: 'https://colombiatic.com',
                    products: [
                        'Desarrollo de Sitios Web',
                        'Tiendas Online',
                        'Aplicaciones Móviles',
                        'Marketing Digital',
                        'Consultoría Tecnológica'
                    ],
                    services: [
                        'Diseño Web Responsivo',
                        'Optimización SEO',
                        'Integración de Pasarelas de Pago',
                        'Soporte Técnico 24/7',
                        'Mantenimiento de Sitios Web'
                    ],
                }
            };
            const result = await this.agentService.execute(enhancedDto);
            this.logger.log('Omnichannel customer service executed successfully', {
                hasResult: !!result,
                resultType: typeof result,
                resultKeys: result ? Object.keys(result) : null
            });
            return result;
        }
        catch (error) {
            this.logger.error('Error in omnichannel customer service controller', error.stack);
            throw error;
        }
    }
    async getMetrics() {
        return this.agentService.reportMetrics();
    }
};
exports.ColombiaTicSalesController = ColombiaTicSalesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process omnichannel customer service request' }),
    (0, swagger_1.ApiBody)({ type: front_desk_request_dto_1.FrontDeskRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Customer service processing executed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, front_desk_request_dto_1.FrontDeskRequestDto]),
    __metadata("design:returntype", Promise)
], ColombiaTicSalesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer service agent metrics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Customer service agent metrics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ColombiaTicSalesController.prototype, "getMetrics", null);
exports.ColombiaTicSalesController = ColombiaTicSalesController = ColombiaTicSalesController_1 = __decorate([
    (0, swagger_1.ApiTags)('Agent - Omnichannel Customer Service'),
    (0, common_1.Controller)('v2/agents/omnichannel-customer-service'),
    __metadata("design:paramtypes", [front_desk_v2_service_1.FrontDeskV2Service])
], ColombiaTicSalesController);
//# sourceMappingURL=colombiatic-sales.controller.js.map