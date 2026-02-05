import { Injectable, Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class TenantEncryptionService {
  private readonly logger = new Logger(TenantEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits

  constructor(private readonly redisService: RedisService) {}

  /**
   * Generate tenant-specific encryption key
   * @param tenantId Tenant ID
   * @returns Encryption key
   */
  async generateTenantKey(tenantId: string): Promise<string> {
    try {
      // Generate a random key
      const key = randomBytes(this.keyLength);
      const keyHex = key.toString('hex');
      
      // Store the key in Redis with tenant scope
      await this.redisService.setForTenant(
        tenantId,
        'encryption:key',
        keyHex,
        86400 * 30 // 30 days TTL
      );
      
      this.logger.log(`Generated encryption key for tenant ${tenantId}`);
      return keyHex;
    } catch (error) {
      this.logger.error(`Failed to generate encryption key for tenant ${tenantId}`, error);
      throw new Error(`Failed to generate encryption key: ${error.message}`);
    }
  }

  /**
   * Get tenant encryption key
   * @param tenantId Tenant ID
   * @returns Encryption key or null if not found
   */
  async getTenantKey(tenantId: string): Promise<string | null> {
    try {
      // Try to get existing key from Redis
      let keyHex = await this.redisService.getForTenant(tenantId, 'encryption:key');
      
      // If no key exists, generate a new one
      if (!keyHex) {
        keyHex = await this.generateTenantKey(tenantId);
      }
      
      return keyHex;
    } catch (error) {
      this.logger.error(`Failed to get encryption key for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Encrypt data for a tenant
   * @param tenantId Tenant ID
   * @param data Data to encrypt
   * @returns Encrypted data with IV and auth tag
   */
  async encryptForTenant(tenantId: string, data: string): Promise<string> {
    try {
      const keyHex = await this.getTenantKey(tenantId);
      if (!keyHex) {
        throw new Error(`No encryption key available for tenant ${tenantId}`);
      }
      
      const key = Buffer.from(keyHex, 'hex');
      const iv = randomBytes(16); // 128 bits IV
      const cipher = createCipheriv(this.algorithm, key, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine IV, auth tag, and encrypted data
      const result = JSON.stringify({
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        data: encrypted,
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to encrypt data for tenant ${tenantId}`, error);
      throw new Error(`Failed to encrypt data: ${error.message}`);
    }
  }

  /**
   * Decrypt data for a tenant
   * @param tenantId Tenant ID
   * @param encryptedData Encrypted data with IV and auth tag
   * @returns Decrypted data
   */
  async decryptForTenant(tenantId: string, encryptedData: string): Promise<string> {
    try {
      const keyHex = await this.getTenantKey(tenantId);
      if (!keyHex) {
        throw new Error(`No encryption key available for tenant ${tenantId}`);
      }
      
      const key = Buffer.from(keyHex, 'hex');
      const { iv, authTag, data } = JSON.parse(encryptedData);
      
      const decipher = createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Failed to decrypt data for tenant ${tenantId}`, error);
      throw new Error(`Failed to decrypt data: ${error.message}`);
    }
  }

  /**
   * Generate tenant-specific HMAC key for data integrity
   * @param tenantId Tenant ID
   * @returns HMAC key
   */
  async generateHmacKey(tenantId: string): Promise<string> {
    try {
      // Generate a random HMAC key
      const hmacKey = randomBytes(32);
      const hmacKeyHex = hmacKey.toString('hex');
      
      // Store the HMAC key in Redis with tenant scope
      await this.redisService.setForTenant(
        tenantId,
        'encryption:hmac_key',
        hmacKeyHex,
        86400 * 30 // 30 days TTL
      );
      
      this.logger.log(`Generated HMAC key for tenant ${tenantId}`);
      return hmacKeyHex;
    } catch (error) {
      this.logger.error(`Failed to generate HMAC key for tenant ${tenantId}`, error);
      throw new Error(`Failed to generate HMAC key: ${error.message}`);
    }
  }

  /**
   * Get tenant HMAC key
   * @param tenantId Tenant ID
   * @returns HMAC key or null if not found
   */
  async getHmacKey(tenantId: string): Promise<string | null> {
    try {
      // Try to get existing HMAC key from Redis
      let hmacKeyHex = await this.redisService.getForTenant(tenantId, 'encryption:hmac_key');
      
      // If no key exists, generate a new one
      if (!hmacKeyHex) {
        hmacKeyHex = await this.generateHmacKey(tenantId);
      }
      
      return hmacKeyHex;
    } catch (error) {
      this.logger.error(`Failed to get HMAC key for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Create HMAC signature for data
   * @param tenantId Tenant ID
   * @param data Data to sign
   * @returns HMAC signature
   */
  async createHmacSignature(tenantId: string, data: string): Promise<string> {
    try {
      const hmacKeyHex = await this.getHmacKey(tenantId);
      if (!hmacKeyHex) {
        throw new Error(`No HMAC key available for tenant ${tenantId}`);
      }
      
      const hmacKey = Buffer.from(hmacKeyHex, 'hex');
      const hmac = createHash('sha256');
      hmac.update(data);
      hmac.update(hmacKey);
      
      return hmac.digest('hex');
    } catch (error) {
      this.logger.error(`Failed to create HMAC signature for tenant ${tenantId}`, error);
      throw new Error(`Failed to create HMAC signature: ${error.message}`);
    }
  }

  /**
   * Verify HMAC signature for data
   * @param tenantId Tenant ID
   * @param data Data to verify
   * @param signature Signature to verify
   * @returns Boolean indicating if signature is valid
   */
  async verifyHmacSignature(tenantId: string, data: string, signature: string): Promise<boolean> {
    try {
      const expectedSignature = await this.createHmacSignature(tenantId, data);
      return expectedSignature === signature;
    } catch (error) {
      this.logger.error(`Failed to verify HMAC signature for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Rotate encryption keys for a tenant
   * @param tenantId Tenant ID
   * @returns Boolean indicating success
   */
  async rotateKeys(tenantId: string): Promise<boolean> {
    try {
      // Generate new encryption key
      await this.generateTenantKey(tenantId);
      
      // Generate new HMAC key
      await this.generateHmacKey(tenantId);
      
      this.logger.log(`Rotated encryption keys for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to rotate encryption keys for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Delete tenant encryption keys
   * @param tenantId Tenant ID
   * @returns Boolean indicating success
   */
  async deleteTenantKeys(tenantId: string): Promise<boolean> {
    try {
      // Delete encryption key from Redis
      await this.redisService.delForTenant(tenantId, 'encryption:key');
      
      // Delete HMAC key from Redis
      await this.redisService.delForTenant(tenantId, 'encryption:hmac_key');
      
      this.logger.log(`Deleted encryption keys for tenant ${tenantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete encryption keys for tenant ${tenantId}`, error);
      return false;
    }
  }
}