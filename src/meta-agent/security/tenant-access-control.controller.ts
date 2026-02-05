import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TenantAccessControlService, AccessPolicy, Role } from './tenant-access-control.service';

@ApiTags('Tenant Access Control')
@Controller('access-control')
export class TenantAccessController {
  constructor(private readonly accessControlService: TenantAccessControlService) {}

  @Post('tenants/:tenantId/policies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new access policy' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
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
  })
  @ApiResponse({
    status: 201,
    description: 'Access policy created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createPolicy(
    @Param('tenantId') tenantId: string,
    @Body() policyData: Omit<AccessPolicy, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ) {
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
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create access policy',
      };
    }
  }

  @Get('tenants/:tenantId/policies/:policyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an access policy by ID' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'policyId',
    required: true,
    type: 'string',
    example: 'policy-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Access policy retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPolicy(
    @Param('tenantId') tenantId: string,
    @Param('policyId') policyId: string,
  ) {
    try {
      const data = await this.accessControlService.getPolicy(tenantId, policyId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Access policy retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Policy not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve access policy',
      };
    }
  }

  @Get('tenants/:tenantId/policies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all policies for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTenantPolicies(@Param('tenantId') tenantId: string) {
    try {
      const data = await this.accessControlService.getTenantPolicies(tenantId);
      return {
        success: true,
        data,
        message: 'Access policies retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve access policies',
      };
    }
  }

  @Put('tenants/:tenantId/policies/:policyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an access policy' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'policyId',
    required: true,
    type: 'string',
    example: 'policy-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
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
  })
  @ApiResponse({
    status: 200,
    description: 'Access policy updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updatePolicy(
    @Param('tenantId') tenantId: string,
    @Param('policyId') policyId: string,
    @Body() updates: Partial<Omit<AccessPolicy, 'id' | 'tenantId' | 'createdAt'>>,
  ) {
    try {
      const data = await this.accessControlService.updatePolicy(tenantId, policyId, updates);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Access policy updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Policy not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update access policy',
      };
    }
  }

  @Delete('tenants/:tenantId/policies/:policyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an access policy' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'policyId',
    required: true,
    type: 'string',
    example: 'policy-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Access policy deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deletePolicy(
    @Param('tenantId') tenantId: string,
    @Param('policyId') policyId: string,
  ) {
    try {
      const result = await this.accessControlService.deletePolicy(tenantId, policyId);
      
      if (result) {
        return {
          success: true,
          message: 'Access policy deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Policy not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete access policy',
      };
    }
  }

  @Post('tenants/:tenantId/roles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
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
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createRole(
    @Param('tenantId') tenantId: string,
    @Body() roleData: Omit<Role, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ) {
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
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create role',
      };
    }
  }

  @Get('tenants/:tenantId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    type: 'string',
    example: 'role-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRole(
    @Param('tenantId') tenantId: string,
    @Param('roleId') roleId: string,
  ) {
    try {
      const data = await this.accessControlService.getRole(tenantId, roleId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Role retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'Role not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve role',
      };
    }
  }

  @Get('tenants/:tenantId/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTenantRoles(@Param('tenantId') tenantId: string) {
    try {
      const data = await this.accessControlService.getTenantRoles(tenantId);
      return {
        success: true,
        data,
        message: 'Roles retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve roles',
      };
    }
  }

  @Put('tenants/:tenantId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    type: 'string',
    example: 'role-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
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
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateRole(
    @Param('tenantId') tenantId: string,
    @Param('roleId') roleId: string,
    @Body() updates: Partial<Omit<Role, 'id' | 'tenantId' | 'createdAt'>>,
  ) {
    try {
      const data = await this.accessControlService.updateRole(tenantId, roleId, updates);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Role updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Role not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update role',
      };
    }
  }

  @Delete('tenants/:tenantId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    type: 'string',
    example: 'role-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteRole(
    @Param('tenantId') tenantId: string,
    @Param('roleId') roleId: string,
  ) {
    try {
      const result = await this.accessControlService.deleteRole(tenantId, roleId);
      
      if (result) {
        return {
          success: true,
          message: 'Role deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Role not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete role',
      };
    }
  }

  @Post('tenants/:tenantId/users/:userId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: 'string',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    type: 'string',
    example: 'role-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned to user successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async assignRoleToUser(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    try {
      const result = await this.accessControlService.assignRoleToUser(tenantId, userId, roleId);
      
      if (result) {
        return {
          success: true,
          message: 'Role assigned to user successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to assign role to user',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to assign role to user',
      };
    }
  }

  @Delete('tenants/:tenantId/users/:userId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: 'string',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    type: 'string',
    example: 'role-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Role removed from user successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async removeRoleFromUser(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    try {
      const result = await this.accessControlService.removeRoleFromUser(tenantId, userId, roleId);
      
      if (result) {
        return {
          success: true,
          message: 'Role removed from user successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to remove role from user',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove role from user',
      };
    }
  }

  @Get('tenants/:tenantId/users/:userId/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles for a user' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: 'string',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserRoles(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
  ) {
    try {
      const data = await this.accessControlService.getUserRoleDetails(tenantId, userId);
      return {
        success: true,
        data,
        message: 'User roles retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve user roles',
      };
    }
  }

  @Post('tenants/:tenantId/users/:userId/permissions/:permission/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if a user has a specific permission' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: 'string',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'permission',
    required: true,
    type: 'string',
    example: 'read:users',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission check completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async checkUserPermission(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Param('permission') permission: string,
  ) {
    try {
      const data = await this.accessControlService.userHasPermission(tenantId, userId, permission);
      return {
        success: true,
        data,
        message: 'Permission check completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to check user permission',
      };
    }
  }

  @Post('tenants/:tenantId/users/:userId/access/:resource/:action/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if a user has access to a resource' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    type: 'string',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'resource',
    required: true,
    type: 'string',
    example: 'users',
  })
  @ApiParam({
    name: 'action',
    required: true,
    type: 'string',
    example: 'read',
  })
  @ApiResponse({
    status: 200,
    description: 'Access check completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async checkUserAccess(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Param('resource') resource: string,
    @Param('action') action: string,
  ) {
    try {
      const data = await this.accessControlService.userHasAccess(tenantId, userId, resource, action);
      return {
        success: true,
        data,
        message: 'Access check completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to check user access',
      };
    }
  }
}