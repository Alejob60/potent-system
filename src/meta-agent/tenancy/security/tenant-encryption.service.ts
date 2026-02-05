import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TenantEncryptionService {
  private readonly logger = new Logger(TenantEncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly authTagLength = 16;

  /**
   * Generate a tenant-specific encryption key
   * @param tenantId - The tenant identifier
   * @returns A base64 encoded encryption key
   */
  generateTenantKey(tenantId: string): string {
    try {
      // Use a master key and tenant ID to derive a tenant-specific key
      const masterKey = process.env.TENANT_MASTER_KEY;
      if (!masterKey) {
        throw new Error('TENANT_MASTER_KEY environment variable not set');
      }

      // Derive tenant-specific key using HKDF
      const tenantKey = crypto.pbkdf2Sync(
        masterKey,
        tenantId,
        10000, // iterations
        this.keyLength, // key length
        'sha256' // hash algorithm
      );

      return tenantKey.toString('base64');
    } catch (error) {
      this.logger.error(`Failed to generate tenant key for ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Encrypt data using tenant-specific key
   * @param plaintext - The data to encrypt
   * @param tenantId - The tenant identifier
   * @returns Encrypted data with IV and auth tag
   */
  encrypt(plaintext: string, tenantId: string): string {
    try {
      const key = Buffer.from(this.generateTenantKey(tenantId), 'base64');
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ]);
      
      const authTag = cipher.getAuthTag();
      
      // Combine IV, auth tag, and encrypted data
      const result = Buffer.concat([iv, authTag, encrypted]);
      return result.toString('base64');
    } catch (error) {
      this.logger.error(`Failed to encrypt data for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrypt data using tenant-specific key
   * @param ciphertext - The encrypted data
   * @param tenantId - The tenant identifier
   * @returns Decrypted plaintext
   */
  decrypt(ciphertext: string, tenantId: string): string {
    try {
      const key = Buffer.from(this.generateTenantKey(tenantId), 'base64');
      const data = Buffer.from(ciphertext, 'base64');
      
      // Extract IV, auth tag, and encrypted data
      const iv = data.subarray(0, this.ivLength);
      const authTag = data.subarray(this.ivLength, this.ivLength + this.authTagLength);
      const encrypted = data.subarray(this.ivLength + this.authTagLength);
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error(`Failed to decrypt data for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hash sensitive data for storage
   * @param data - The data to hash
   * @param tenantId - The tenant identifier
   * @returns Hashed data
   */
  hash(data: string, tenantId: string): string {
    try {
      const key = this.generateTenantKey(tenantId);
      const hash = crypto
        .createHmac('sha256', key)
        .update(data)
        .digest('hex');
      return hash;
    } catch (error) {
      this.logger.error(`Failed to hash data for tenant ${tenantId}: ${error.message}`);
      throw error;
    }
  }
}