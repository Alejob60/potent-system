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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let EncryptionService = EncryptionService_1 = class EncryptionService {
    constructor() {
        this.logger = new common_1.Logger(EncryptionService_1.name);
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        this.initializeEncryptionKey();
    }
    initializeEncryptionKey() {
        const envKey = process.env.DATABASE_ENCRYPTION_KEY;
        if (!envKey) {
            this.logger.warn('DATABASE_ENCRYPTION_KEY not found, generating temporary key for development');
            this.encryptionKey = crypto.randomBytes(this.keyLength);
            return;
        }
        if (envKey.length !== 64) {
            throw new Error('DATABASE_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
        }
        try {
            this.encryptionKey = Buffer.from(envKey, 'hex');
        }
        catch (error) {
            throw new Error('Invalid DATABASE_ENCRYPTION_KEY format. Must be hex encoded.');
        }
    }
    encrypt(plaintext) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
            cipher.setAAD(Buffer.from('oauth-token'));
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();
            const combined = iv.toString('hex') + tag.toString('hex') + encrypted;
            return combined;
        }
        catch (error) {
            this.logger.error('Encryption failed:', error.message);
            throw new Error('Failed to encrypt sensitive data');
        }
    }
    decrypt(encryptedData) {
        try {
            const ivHex = encryptedData.slice(0, this.ivLength * 2);
            const tagHex = encryptedData.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2);
            const encrypted = encryptedData.slice((this.ivLength + this.tagLength) * 2);
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
            decipher.setAAD(Buffer.from('oauth-token'));
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            this.logger.error('Decryption failed:', error.message);
            throw new Error('Failed to decrypt sensitive data');
        }
    }
    hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    safeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    }
    static generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = EncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map