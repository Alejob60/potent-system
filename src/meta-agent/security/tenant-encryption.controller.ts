import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TenantEncryptionService } from './tenant-encryption.service';

@ApiTags('Tenant Encryption')
@Controller('encryption')
export class TenantEncryptionController {
  constructor(private readonly encryptionService: TenantEncryptionService) {}

  @Post('tenants/:tenantId/encrypt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encrypt data for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Data to encrypt',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', example: 'Sensitive tenant data' },
      },
      required: ['data'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data encrypted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async encryptData(
    @Param('tenantId') tenantId: string,
    @Body('data') data: string,
  ) {
    try {
      const encryptedData = await this.encryptionService.encryptForTenant(tenantId, data);
      return {
        success: true,
        data: encryptedData,
        message: 'Data encrypted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to encrypt data',
      };
    }
  }

  @Post('tenants/:tenantId/decrypt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Decrypt data for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Data to decrypt',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', example: '{"iv":"...","authTag":"...","data":"..."}' },
      },
      required: ['data'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data decrypted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async decryptData(
    @Param('tenantId') tenantId: string,
    @Body('data') encryptedData: string,
  ) {
    try {
      const data = await this.encryptionService.decryptForTenant(tenantId, encryptedData);
      return {
        success: true,
        data,
        message: 'Data decrypted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to decrypt data',
      };
    }
  }

  @Post('tenants/:tenantId/sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create HMAC signature for data' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Data to sign',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', example: 'Data to sign' },
      },
      required: ['data'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'HMAC signature created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createSignature(
    @Param('tenantId') tenantId: string,
    @Body('data') data: string,
  ) {
    try {
      const signature = await this.encryptionService.createHmacSignature(tenantId, data);
      return {
        success: true,
        data: signature,
        message: 'HMAC signature created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create HMAC signature',
      };
    }
  }

  @Post('tenants/:tenantId/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify HMAC signature for data' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Data and signature to verify',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', example: 'Data to verify' },
        signature: { type: 'string', example: 'HMAC signature' },
      },
      required: ['data', 'signature'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'HMAC signature verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async verifySignature(
    @Param('tenantId') tenantId: string,
    @Body('data') data: string,
    @Body('signature') signature: string,
  ) {
    try {
      const isValid = await this.encryptionService.verifyHmacSignature(tenantId, data, signature);
      return {
        success: true,
        data: isValid,
        message: 'HMAC signature verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to verify HMAC signature',
      };
    }
  }

  @Post('tenants/:tenantId/rotate-keys')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate encryption keys for a tenant' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Encryption keys rotated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async rotateKeys(@Param('tenantId') tenantId: string) {
    try {
      const result = await this.encryptionService.rotateKeys(tenantId);
      
      if (result) {
        return {
          success: true,
          message: 'Encryption keys rotated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to rotate encryption keys',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to rotate encryption keys',
      };
    }
  }

  @Delete('tenants/:tenantId/keys')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete tenant encryption keys' })
  @ApiParam({
    name: 'tenantId',
    required: true,
    type: 'string',
    example: 'tenant-123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Encryption keys deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteKeys(@Param('tenantId') tenantId: string) {
    try {
      const result = await this.encryptionService.deleteTenantKeys(tenantId);
      
      if (result) {
        return {
          success: true,
          message: 'Encryption keys deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to delete encryption keys',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete encryption keys',
      };
    }
  }
}