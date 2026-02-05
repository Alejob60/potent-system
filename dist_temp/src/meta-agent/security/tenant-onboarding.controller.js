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
exports.TenantOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_onboarding_service_1 = require("./tenant-onboarding.service");
let TenantOnboardingController = class TenantOnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async startOnboarding(tenantId) {
        try {
            const data = await this.onboardingService.startOnboarding(tenantId);
            return {
                success: true,
                data,
                message: 'Onboarding process started successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Tenant not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to start onboarding process',
            };
        }
    }
    async getOnboardingStatus(tenantId) {
        try {
            const data = this.onboardingService.getOnboardingStatus(tenantId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Onboarding status retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Onboarding not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve onboarding status',
            };
        }
    }
    async completeOnboardingStep(tenantId, stepId, data) {
        try {
            const result = await this.onboardingService.completeOnboardingStep(tenantId, stepId, data);
            return {
                success: true,
                data: result,
                message: 'Onboarding step completed successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Onboarding or step not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to complete onboarding step',
            };
        }
    }
    async skipOnboardingStep(tenantId, stepId) {
        try {
            const result = await this.onboardingService.skipOnboardingStep(tenantId, stepId);
            return {
                success: true,
                data: result,
                message: 'Onboarding step skipped successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Onboarding or step not found',
                };
            }
            if (error.message.includes('Cannot skip')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Cannot skip required step',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to skip onboarding step',
            };
        }
    }
    async resetOnboarding(tenantId) {
        try {
            const data = await this.onboardingService.resetOnboarding(tenantId);
            return {
                success: true,
                data,
                message: 'Onboarding process reset successfully',
            };
        }
        catch (error) {
            if (error.message.includes('not found')) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Onboarding not found',
                };
            }
            return {
                success: false,
                error: error.message,
                message: 'Failed to reset onboarding process',
            };
        }
    }
};
exports.TenantOnboardingController = TenantOnboardingController;
__decorate([
    (0, common_1.Post)('tenants/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Start onboarding process for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Onboarding process started successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantOnboardingController.prototype, "startOnboarding", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get onboarding status for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantOnboardingController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/steps/:stepId/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Complete an onboarding step' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'stepId',
        required: true,
        type: 'string',
        example: 'setup-business-profile',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Step-specific data',
        schema: {
            type: 'object',
            example: {
                businessProfile: {
                    industry: 'Technology',
                    size: 'medium',
                    location: 'US',
                    primaryLanguage: 'en',
                    timezone: 'America/New_York',
                    businessHours: {
                        start: '09:00',
                        end: '17:00',
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding step completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding or step not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TenantOnboardingController.prototype, "completeOnboardingStep", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/steps/:stepId/skip'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Skip an onboarding step' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'stepId',
        required: true,
        type: 'string',
        example: 'configure-branding',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding step skipped successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding or step not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot skip required step' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantOnboardingController.prototype, "skipOnboardingStep", null);
__decorate([
    (0, common_1.Patch)('tenants/:tenantId/reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset onboarding process for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Onboarding process reset successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Onboarding not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantOnboardingController.prototype, "resetOnboarding", null);
exports.TenantOnboardingController = TenantOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Onboarding'),
    (0, common_1.Controller)('onboarding'),
    __metadata("design:paramtypes", [tenant_onboarding_service_1.TenantOnboardingService])
], TenantOnboardingController);
//# sourceMappingURL=tenant-onboarding.controller.js.map