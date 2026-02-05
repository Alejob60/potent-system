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
exports.TenantAccessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_access_control_service_1 = require("./tenant-access-control.service");
let TenantAccessController = class TenantAccessController {
    constructor(accessControlService) {
        this.accessControlService = accessControlService;
    }
    async createPolicy(tenantId, policyData) {
        try {
            const data = await this.accessControlService.createPolicy({
                ...policyData,
                tenantId,
            });
            return {
                success: true,
                data,
                message: 'Access policy created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create access policy',
            };
        }
    }
    async getPolicy(tenantId, policyId) {
        try {
            const data = await this.accessControlService.getPolicy(tenantId, policyId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Access policy retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Policy not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve access policy',
            };
        }
    }
    async getTenantPolicies(tenantId) {
        try {
            const data = await this.accessControlService.getTenantPolicies(tenantId);
            return {
                success: true,
                data,
                message: 'Access policies retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve access policies',
            };
        }
    }
    async updatePolicy(tenantId, policyId, updates) {
        try {
            const data = await this.accessControlService.updatePolicy(tenantId, policyId, updates);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Access policy updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Policy not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update access policy',
            };
        }
    }
    async deletePolicy(tenantId, policyId) {
        try {
            const result = await this.accessControlService.deletePolicy(tenantId, policyId);
            if (result) {
                return {
                    success: true,
                    message: 'Access policy deleted successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Policy not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete access policy',
            };
        }
    }
    async createRole(tenantId, roleData) {
        try {
            const data = await this.accessControlService.createRole({
                ...roleData,
                tenantId,
            });
            return {
                success: true,
                data,
                message: 'Role created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create role',
            };
        }
    }
    async getRole(tenantId, roleId) {
        try {
            const data = await this.accessControlService.getRole(tenantId, roleId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Role retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Role not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve role',
            };
        }
    }
    async getTenantRoles(tenantId) {
        try {
            const data = await this.accessControlService.getTenantRoles(tenantId);
            return {
                success: true,
                data,
                message: 'Roles retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve roles',
            };
        }
    }
    async updateRole(tenantId, roleId, updates) {
        try {
            const data = await this.accessControlService.updateRole(tenantId, roleId, updates);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Role updated successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Role not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update role',
            };
        }
    }
    async deleteRole(tenantId, roleId) {
        try {
            const result = await this.accessControlService.deleteRole(tenantId, roleId);
            if (result) {
                return {
                    success: true,
                    message: 'Role deleted successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Role not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete role',
            };
        }
    }
    async assignRoleToUser(tenantId, userId, roleId) {
        try {
            const result = await this.accessControlService.assignRoleToUser(tenantId, userId, roleId);
            if (result) {
                return {
                    success: true,
                    message: 'Role assigned to user successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to assign role to user',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to assign role to user',
            };
        }
    }
    async removeRoleFromUser(tenantId, userId, roleId) {
        try {
            const result = await this.accessControlService.removeRoleFromUser(tenantId, userId, roleId);
            if (result) {
                return {
                    success: true,
                    message: 'Role removed from user successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to remove role from user',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to remove role from user',
            };
        }
    }
    async getUserRoles(tenantId, userId) {
        try {
            const data = await this.accessControlService.getUserRoleDetails(tenantId, userId);
            return {
                success: true,
                data,
                message: 'User roles retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve user roles',
            };
        }
    }
    async checkUserPermission(tenantId, userId, permission) {
        try {
            const data = await this.accessControlService.userHasPermission(tenantId, userId, permission);
            return {
                success: true,
                data,
                message: 'Permission check completed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to check user permission',
            };
        }
    }
    async checkUserAccess(tenantId, userId, resource, action) {
        try {
            const data = await this.accessControlService.userHasAccess(tenantId, userId, resource, action);
            return {
                success: true,
                data,
                message: 'Access check completed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to check user access',
            };
        }
    }
};
exports.TenantAccessController = TenantAccessController;
__decorate([
    (0, common_1.Post)('tenants/:tenantId/policies'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new access policy' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Access policy to create',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Admin Policy' },
                description: { type: 'string', example: 'Policy for administrators' },
                roles: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['role-admin'],
                },
                permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['read', 'write', 'delete'],
                },
                resources: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['users', 'settings'],
                },
                effect: {
                    type: 'string',
                    enum: ['allow', 'deny'],
                    example: 'allow',
                },
                priority: { type: 'number', example: 1 },
                isActive: { type: 'boolean', example: true },
            },
            required: ['name', 'roles', 'permissions', 'resources', 'effect', 'priority'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Access policy created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/policies/:policyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get an access policy by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'policyId',
        required: true,
        type: 'string',
        example: 'policy-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access policy retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('policyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "getPolicy", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/policies'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all policies for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access policies retrieved successfully',
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
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "getTenantPolicies", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId/policies/:policyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update an access policy' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'policyId',
        required: true,
        type: 'string',
        example: 'policy-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Policy updates',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Updated Admin Policy' },
                description: { type: 'string', example: 'Updated policy for administrators' },
                roles: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['role-admin', 'role-superadmin'],
                },
                permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['read', 'write', 'delete', 'admin'],
                },
                resources: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['users', 'settings', 'reports'],
                },
                effect: {
                    type: 'string',
                    enum: ['allow', 'deny'],
                    example: 'allow',
                },
                priority: { type: 'number', example: 1 },
                isActive: { type: 'boolean', example: true },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access policy updated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('policyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId/policies/:policyId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an access policy' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'policyId',
        required: true,
        type: 'string',
        example: 'policy-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access policy deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('policyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "deletePolicy", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/roles'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new role' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Role to create',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Administrator' },
                description: { type: 'string', example: 'System administrator role' },
                permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['read', 'write', 'delete', 'admin'],
                },
            },
            required: ['name', 'permissions'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Role created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "createRole", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/roles/:roleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a role by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'roleId',
        required: true,
        type: 'string',
        example: 'role-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "getRole", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/roles'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles for a tenant' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Roles retrieved successfully',
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
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "getTenantRoles", null);
__decorate([
    (0, common_1.Put)('tenants/:tenantId/roles/:roleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update a role' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'roleId',
        required: true,
        type: 'string',
        example: 'role-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Role updates',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Updated Administrator' },
                description: { type: 'string', example: 'Updated system administrator role' },
                permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['read', 'write', 'delete', 'admin', 'configure'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role updated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('roleId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId/roles/:roleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a role' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'roleId',
        required: true,
        type: 'string',
        example: 'role-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/users/:userId/roles/:roleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a role to a user' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        required: true,
        type: 'string',
        example: 'user-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'roleId',
        required: true,
        type: 'string',
        example: 'role-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role assigned to user successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User or role not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "assignRoleToUser", null);
__decorate([
    (0, common_1.Delete)('tenants/:tenantId/users/:userId/roles/:roleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a role from a user' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        required: true,
        type: 'string',
        example: 'user-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'roleId',
        required: true,
        type: 'string',
        example: 'role-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role removed from user successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User or role not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "removeRoleFromUser", null);
__decorate([
    (0, common_1.Get)('tenants/:tenantId/users/:userId/roles'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles for a user' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        required: true,
        type: 'string',
        example: 'user-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User roles retrieved successfully',
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
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/users/:userId/permissions/:permission/check'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a user has a specific permission' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        required: true,
        type: 'string',
        example: 'user-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'permission',
        required: true,
        type: 'string',
        example: 'read:users',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Permission check completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "checkUserPermission", null);
__decorate([
    (0, common_1.Post)('tenants/:tenantId/users/:userId/access/:resource/:action/check'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a user has access to a resource' }),
    (0, swagger_1.ApiParam)({
        name: 'tenantId',
        required: true,
        type: 'string',
        example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        required: true,
        type: 'string',
        example: 'user-123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'resource',
        required: true,
        type: 'string',
        example: 'users',
    }),
    (0, swagger_1.ApiParam)({
        name: 'action',
        required: true,
        type: 'string',
        example: 'read',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access check completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'boolean' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Param)('resource')),
    __param(3, (0, common_1.Param)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TenantAccessController.prototype, "checkUserAccess", null);
exports.TenantAccessController = TenantAccessController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Access Control'),
    (0, common_1.Controller)('access-control'),
    __metadata("design:paramtypes", [tenant_access_control_service_1.TenantAccessControlService])
], TenantAccessController);
//# sourceMappingURL=tenant-access-control.controller.js.map