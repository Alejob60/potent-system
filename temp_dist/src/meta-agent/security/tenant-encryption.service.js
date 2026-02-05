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
var TenantEncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantEncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const redis_service_1 = require("../../common/redis/redis.service");
let TenantEncryptionService = TenantEncryptionService_1 = class TenantEncryptionService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(TenantEncryptionService_1.name);
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
    }
    async generateTenantKey(tenantId) {
        try {
            const key = (0, crypto_1.randomBytes)(this.keyLength);
            const keyHex = key.toString('hex');
            await this.redisService.setForTenant(tenantId, 'encryption:key', keyHex, 86400 * 30);
            this.logger.log(`Generated encryption key for tenant ${tenantId}`);
            return keyHex;
        }
        catch (error) {
            this.logger.error(`Failed to generate encryption key for tenant ${tenantId}`, error);
            throw new Error(`Failed to generate encryption key: ${error.message}`);
        }
    }
    async getTenantKey(tenantId) {
        try {
            let keyHex = await this.redisService.getForTenant(tenantId, 'encryption:key');
            if (!keyHex) {
                keyHex = await this.generateTenantKey(tenantId);
            }
            return keyHex;
        }
        catch (error) {
            this.logger.error(`Failed to get encryption key for tenant ${tenantId}`, error);
            return null;
        }
    }
    async encryptForTenant(tenantId, data) {
        try {
            const keyHex = await this.getTenantKey(tenantId);
            if (!keyHex) {
                throw new Error(`No encryption key available for tenant ${tenantId}`);
            }
            const key = Buffer.from(keyHex, 'hex');
            const iv = (0, crypto_1.randomBytes)(16);
            const cipher = (0, crypto_1.createCipheriv)(this.algorithm, key, iv);
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();
            const result = JSON.stringify({
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex'),
                data: encrypted,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to encrypt data for tenant ${tenantId}`, error);
            throw new Error(`Failed to encrypt data: ${error.message}`);
        }
    }
    async decryptForTenant(tenantId, encryptedData) {
        try {
            const keyHex = await this.getTenantKey(tenantId);
            if (!keyHex) {
                throw new Error(`No encryption key available for tenant ${tenantId}`);
            }
            const key = Buffer.from(keyHex, 'hex');
            const { iv, authTag, data } = JSON.parse(encryptedData);
            const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, key, Buffer.from(iv, 'hex'));
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            let decrypted = decipher.update(data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Failed to decrypt data for tenant ${tenantId}`, error);
            throw new Error(`Failed to decrypt data: ${error.message}`);
        }
    }
    async generateHmacKey(tenantId) {
        try {
            const hmacKey = (0, crypto_1.randomBytes)(32);
            const hmacKeyHex = hmacKey.toString('hex');
            await this.redisService.setForTenant(tenantId, 'encryption:hmac_key', hmacKeyHex, 86400 * 30);
            this.logger.log(`Generated HMAC key for tenant ${tenantId}`);
            return hmacKeyHex;
        }
        catch (error) {
            this.logger.error(`Failed to generate HMAC key for tenant ${tenantId}`, error);
            throw new Error(`Failed to generate HMAC key: ${error.message}`);
        }
    }
    async getHmacKey(tenantId) {
        try {
            let hmacKeyHex = await this.redisService.getForTenant(tenantId, 'encryption:hmac_key');
            if (!hmacKeyHex) {
                hmacKeyHex = await this.generateHmacKey(tenantId);
            }
            return hmacKeyHex;
        }
        catch (error) {
            this.logger.error(`Failed to get HMAC key for tenant ${tenantId}`, error);
            return null;
        }
    }
    async createHmacSignature(tenantId, data) {
        try {
            const hmacKeyHex = await this.getHmacKey(tenantId);
            if (!hmacKeyHex) {
                throw new Error(`No HMAC key available for tenant ${tenantId}`);
            }
            const hmacKey = Buffer.from(hmacKeyHex, 'hex');
            const hmac = (0, crypto_1.createHash)('sha256');
            hmac.update(data);
            hmac.update(hmacKey);
            return hmac.digest('hex');
        }
        catch (error) {
            this.logger.error(`Failed to create HMAC signature for tenant ${tenantId}`, error);
            throw new Error(`Failed to create HMAC signature: ${error.message}`);
        }
    }
    async verifyHmacSignature(tenantId, data, signature) {
        try {
            const expectedSignature = await this.createHmacSignature(tenantId, data);
            return expectedSignature === signature;
        }
        catch (error) {
            this.logger.error(`Failed to verify HMAC signature for tenant ${tenantId}`, error);
            return false;
        }
    }
    async rotateKeys(tenantId) {
        try {
            await this.generateTenantKey(tenantId);
            await this.generateHmacKey(tenantId);
            this.logger.log(`Rotated encryption keys for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to rotate encryption keys for tenant ${tenantId}`, error);
            return false;
        }
    }
    async deleteTenantKeys(tenantId) {
        try {
            await this.redisService.delForTenant(tenantId, 'encryption:key');
            await this.redisService.delForTenant(tenantId, 'encryption:hmac_key');
            this.logger.log(`Deleted encryption keys for tenant ${tenantId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete encryption keys for tenant ${tenantId}`, error);
            return false;
        }
    }
};
exports.TenantEncryptionService = TenantEncryptionService;
exports.TenantEncryptionService = TenantEncryptionService = TenantEncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], TenantEncryptionService);
//# sourceMappingURL=tenant-encryption.service.js.map