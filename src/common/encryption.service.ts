import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  private encryptionKey: Buffer;

  constructor() {
    this.initializeEncryptionKey();
  }

  private initializeEncryptionKey(): void {
    const envKey = process.env.DATABASE_ENCRYPTION_KEY;

    if (!envKey) {
      // En desarrollo, generar una clave temporal
      this.logger.warn(
        'DATABASE_ENCRYPTION_KEY not found, generating temporary key for development',
      );
      this.encryptionKey = crypto.randomBytes(this.keyLength);
      return;
    }

    if (envKey.length !== 64) {
      // 32 bytes = 64 hex chars
      throw new Error(
        'DATABASE_ENCRYPTION_KEY must be 64 hex characters (32 bytes)',
      );
    }

    try {
      this.encryptionKey = Buffer.from(envKey, 'hex');
    } catch (error) {
      throw new Error(
        'Invalid DATABASE_ENCRYPTION_KEY format. Must be hex encoded.',
      );
    }
  }

  /**
   * Encrypts sensitive data like OAuth tokens
   */
  encrypt(plaintext: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );
      cipher.setAAD(Buffer.from('oauth-token')); // Additional authenticated data

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combine IV + Tag + Encrypted data
      const combined = iv.toString('hex') + tag.toString('hex') + encrypted;

      return combined;
    } catch (error) {
      this.logger.error('Encryption failed:', error.message);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypts sensitive data like OAuth tokens
   */
  decrypt(encryptedData: string): string {
    try {
      // Extract IV, tag, and encrypted data
      const ivHex = encryptedData.slice(0, this.ivLength * 2);
      const tagHex = encryptedData.slice(
        this.ivLength * 2,
        (this.ivLength + this.tagLength) * 2,
      );
      const encrypted = encryptedData.slice(
        (this.ivLength + this.tagLength) * 2,
      );

      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );
      decipher.setAAD(Buffer.from('oauth-token'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed:', error.message);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * Hashes data for comparison (one-way)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generates a secure random string for state parameters
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  /**
   * Generates encryption key for environment setup
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
