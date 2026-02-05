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
exports.TenantEncryptionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_encryption_service_1 = require("./tenant-encryption.service");
let TenantEncryptionController = class TenantEncryptionController {
    constructor(encryptionService) {
        this.encryptionService = encryptionService;
    }
    async encryptData(tenantId, data) {
        try {
            const encryptedData = await this.encryptionService.encryptForTenant(tenantId, data);
            return {
                success: true,
                data: encryptedData,
                message: 'Data encrypted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to encrypt data',
            };
        }
    }
    async decryptData(tenantId, encryptedData) {
        try {
            const data = await this.encryptionService.decryptForTenant(tenantId, encryptedData);
            return {
                success: true,
                data,
                message: 'Data decrypted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to decrypt data',
            };
        }
    }
    async createSignature(tenantId, data) {
        try {
            const signature = await this.encryptionService.createHmacSignature(tenantId, data);
            return {
                success: true,
                data: signature,
                message: 'HMAC signature created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create HMAC signature',
            };
        }
    }
    async verifySignature(tenantId, data, signature) {
        try {
            const isValid = await this.encryptionService.verifyHmacSignature(tenantId, data, signature);
            return {
                success: true,
                data: isValid,
                message: 'HMAC signature verified successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to verify HMAC signature',
            };
        }
    }
    async rotateKeys(tenantId) {
        try {
            const result = await this.encryptionService.rotateKeys(tenantId);
            if (result) {
                return {
                    success: true,
                    message: 'Encryption keys rotated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to rotate encryption keys',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to rotate encryption keys',
            };
        }
    }
    async deleteKeys(tenantId) {
        try {
            const result = await this.encryptionService.deleteTenantKeys(tenantId);
            if (result) {
                return {
                    success: true,
                    message: 'Encryption keys deleted successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to delete encryption keys',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete encryption keys',
            };
        }
    }
};
exports.TenantEncryptionController = TenantEncryptionController;
__decorate([
    (0, common_1.Post)('tenants/:tenantId/encrypt'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Encrypt data for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data to encrypt',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'string', example: 'Sensitive tenant data' },
            },
            required: ['data'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data encrypted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantEncryptionController.prototype, "encryptData", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/decrypt'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Decrypt data for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data to decrypt',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'string', example: '{"iv":"...","authTag":"...","data":"..."}' },
            },
            required: ['data'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Data decrypted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantEncryptionController.prototype, "decryptData", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/sign'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create HMAC signature for data' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data to sign',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'string', example: 'Data to sign' },
            },
            required: ['data'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'HMAC signature created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantEncryptionController.prototype, "createSignature", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify HMAC signature for data' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Data and signature to verify',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'string', example: 'Data to verify' },
                signature: { type: 'string', example: 'HMAC signature' },
            },
            required: ['data', 'signature'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'HMAC signature verified successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)('data')),
    __param(2, (0, common_1.Body)('signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantEncryptionController.prototype, "verifySignature", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/rotate-keys'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate encryption keys for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Encryption keys rotated successfully',
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
], TenantEncryptionController.prototype, "rotateKeys", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId/keys'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete tenant encryption keys' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Encryption keys deleted successfully',
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
], TenantEncryptionController.prototype, "deleteKeys", null);
exports.TenantEncryptionController = TenantEncryptionController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Encryption'),
    (0, common_1.Controller)('encryption'),
    __metadata("design:paramtypes", [tenant_encryption_service_1.TenantEncryptionService])
], TenantEncryptionController);
//# sourceMappingURL=tenant-encryption.controller.js.map