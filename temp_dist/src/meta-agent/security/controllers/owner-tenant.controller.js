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
var OwnerTenantController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OwnerTenantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_management_service_1 = require("../tenant-management.service");
const register_owner_tenant_dto_1 = require("../dtos/register-owner-tenant.dto");
let OwnerTenantController = OwnerTenantController_1 = class OwnerTenantController {
    constructor(tenantManagementService) {
        this.tenantManagementService = tenantManagementService;
        this.logger = new common_1.Logger(OwnerTenantController_1.name);
    }
    async registerOwnerTenant(registerOwnerTenantDto) {
        this.logger.log('Registering owner tenant', { registerOwnerTenantDto });
        try {
            if (!registerOwnerTenantDto.tenantName || !registerOwnerTenantDto.contactEmail ||
                !registerOwnerTenantDto.websiteUrl || !registerOwnerTenantDto.businessIndustry) {
                return {
                    success: false,
                    error: 'Missing required fields: tenantName, contactEmail, websiteUrl, businessIndustry'
                };
            }
            const result = await this.tenantManagementService.registerOwnerTenant(registerOwnerTenantDto);
            this.logger.log('Owner tenant registered successfully', { tenantId: result.tenantId });
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            this.logger.error('Failed to register owner tenant', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
};
exports.OwnerTenantController = OwnerTenantController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register Colombiatic as owner tenant' }),
    (0, swagger_1.ApiBody)({
        type: () => register_owner_tenant_dto_1.RegisterOwnerTenantDto,
        description: 'Owner tenant registration data',
        examples: {
            colombiatic: {
                summary: 'Colombiatic registration',
                value: {
                    tenantName: 'Colombiatic',
                    contactEmail: 'contacto@colombiatic.com',
                    websiteUrl: 'https://colombiatic.com',
                    businessIndustry: 'Technology'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Owner tenant registered successfully',
        schema: {
            type: 'object',
            properties: {
                tenantId: { type: 'string', example: 'colombiatic' },
                siteId: { type: 'string', example: 'colombiatic-site' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                tenantSecret: { type: 'string', example: 'generated-secret-key' },
                allowedOrigins: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['https://colombiatic.com']
                },
                permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['read', 'write', 'admin', 'system', 'owner']
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_owner_tenant_dto_1.RegisterOwnerTenantDto]),
    __metadata("design:returntype", Promise)
], OwnerTenantController.prototype, "registerOwnerTenant", null);
exports.OwnerTenantController = OwnerTenantController = OwnerTenantController_1 = __decorate([
    (0, swagger_1.ApiTags)('Security - Owner Tenant'),
    (0, common_1.Controller)('api/meta-agent/tenants/owner'),
    __metadata("design:paramtypes", [tenant_management_service_1.TenantManagementService])
], OwnerTenantController);
//# sourceMappingURL=owner-tenant.controller.js.map