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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantProvisioningController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_provisioning_service_1 = require("./tenant-provisioning.service");
const register_tenant_dto_1 = require("./dto/register-tenant.dto");
let TenantProvisioningController = class TenantProvisioningController {
    constructor(provisioningService) {
        this.provisioningService = provisioningService;
    }
    async provisionTenant(registerTenantDto) {
        try {
            const result = await this.provisioningService.provisionTenant(registerTenantDto);
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to provision tenant',
            };
        }
    }
    async getProvisioningStatus(provisioningId) {
        try {
            const data = this.provisioningService.getProvisioningStatus(provisioningId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Provisioning status retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Provisioning not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve provisioning status',
            };
        }
    }
    async deprovisionTenant(tenantId) {
        try {
            const result = await this.provisioningService.deprovisionTenant(tenantId);
            if (result) {
                return {
                    success: true,
                    message: 'Tenant deprovisioned successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to deprovision tenant',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to deprovision tenant',
            };
        }
    }
};
exports.TenantProvisioningController = TenantProvisioningController;
__decorate([
    (0, common_1.Post)('tenants'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Provision a new tenant with all required resources' }),
    (0, swagger_1.ApiBody)({
        type: register_tenant_dto_1.RegisterTenantDto,
        examples: {
            example1: {
                summary: 'Example tenant provisioning',
                value: {
                    tenantName: 'Acme Corporation',
                    contactEmail: 'admin@acme.com',
                    websiteUrl: 'https://acme.com',
                    businessIndustry: 'Technology',
                    allowedOrigins: ['https://acme.com', 'https://app.acme.com'],
                    permissions: ['read', 'write', 'admin'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Tenant provisioning started successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                provisioningId: { type: 'string' },
                tenantData: { type: 'object' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_tenant_dto_1.RegisterTenantDto]),
    __metadata("design:returntype", Promise)
], TenantProvisioningController.prototype, "provisionTenant", null);
__decorate([
    (0, common_1.Get)('status/:provisioningId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get provisioning status' }),
    (0, swagger_1.ApiParam)({
        name: 'provisioningId',
        required: true,
        type: 'string',
        example: 'prov-1234567890-abc123def456',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Provisioning status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Provisioning not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('provisioningId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantProvisioningController.prototype, "getProvisioningStatus", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deprovision a tenant and clean up all resources' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tenant deprovisioned successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantProvisioningController.prototype, "deprovisionTenant", null);
exports.TenantProvisioningController = TenantProvisioningController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Provisioning'),
    (0, common_1.Controller)('provisioning'),
    __metadata("design:paramtypes", [tenant_provisioning_service_1.TenantProvisioningService])
], TenantProvisioningController);
//# sourceMappingURL=tenant-provisioning.controller.js.map