"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var TenantEncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantEncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let TenantEncryptionService = TenantEncryptionService_1 = class TenantEncryptionService {
    constructor() {
        this.logger = new common_1.Logger(TenantEncryptionService_1.name);
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.authTagLength = 16;
    }
    generateTenantKey(tenantId) {
        try {
            const masterKey = process.env.TENANT_MASTER_KEY;
            if (!masterKey) {
                throw new Error('TENANT_MASTER_KEY environment variable not set');
            }
            const tenantKey = crypto.pbkdf2Sync(masterKey, tenantId, 10000, this.keyLength, 'sha256');
            return tenantKey.toString('base64');
        }
        catch (error) {
            this.logger.error(`Failed to generate tenant key for ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    encrypt(plaintext, tenantId) {
        try {
            const key = Buffer.from(this.generateTenantKey(tenantId), 'base64');
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, key, iv);
            const encrypted = Buffer.concat([
                cipher.update(plaintext, 'utf8'),
                cipher.final()
            ]);
            const authTag = cipher.getAuthTag();
            const result = Buffer.concat([iv, authTag, encrypted]);
            return result.toString('base64');
        }
        catch (error) {
            this.logger.error(`Failed to encrypt data for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    decrypt(ciphertext, tenantId) {
        try {
            const key = Buffer.from(this.generateTenantKey(tenantId), 'base64');
            const data = Buffer.from(ciphertext, 'base64');
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
        }
        catch (error) {
            this.logger.error(`Failed to decrypt data for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
    hash(data, tenantId) {
        try {
            const key = this.generateTenantKey(tenantId);
            const hash = crypto
                .createHmac('sha256', key)
                .update(data)
                .digest('hex');
            return hash;
        }
        catch (error) {
            this.logger.error(`Failed to hash data for tenant ${tenantId}: ${error.message}`);
            throw error;
        }
    }
};
exports.TenantEncryptionService = TenantEncryptionService;
exports.TenantEncryptionService = TenantEncryptionService = TenantEncryptionService_1 = __decorate([
    (0, common_1.Injectable)()
], TenantEncryptionService);
//# sourceMappingURL=tenant-encryption.service.js.map