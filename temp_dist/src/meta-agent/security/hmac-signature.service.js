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
var HmacSignatureService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HmacSignatureService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
let HmacSignatureService = HmacSignatureService_1 = class HmacSignatureService {
    constructor() {
        this.logger = new common_1.Logger(HmacSignatureService_1.name);
        this.defaultTimestampTolerance = 300;
        this.jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret';
    }
    generateSignature(body, tenantSecret) {
        try {
            const hmac = crypto.createHmac('sha256', tenantSecret);
            hmac.update(body);
            return hmac.digest('hex');
        }
        catch (error) {
            this.logger.error('Failed to generate HMAC signature', error.message);
            throw new Error('Signature generation failed');
        }
    }
    generateAccessToken(tenantId, expiresIn = 3600) {
        try {
            const payload = {
                tenantId,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + expiresIn,
            };
            return jwt.sign(payload, this.jwtSecret);
        }
        catch (error) {
            this.logger.error(`Failed to generate access token for tenant ${tenantId}`, error.message);
            throw new Error('Access token generation failed');
        }
    }
    validateSignature(body, signature, tenantSecret, timestamp, options) {
        try {
            const timestampTolerance = options?.timestampTolerance || this.defaultTimestampTolerance;
            const requestTime = new Date(timestamp).getTime();
            const currentTime = Date.now();
            const timeDiff = Math.abs(currentTime - requestTime) / 1000;
            if (timeDiff > timestampTolerance) {
                this.logger.warn(`Request timestamp too old: ${timeDiff}s > ${timestampTolerance}s`);
                return false;
            }
            const secret = options?.tenantSecret || tenantSecret;
            const expectedSignature = this.generateSignature(body, secret);
            const isValid = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
            if (!isValid) {
                this.logger.warn('HMAC signature validation failed');
            }
            else {
                this.logger.log('HMAC signature validated successfully');
            }
            return isValid;
        }
        catch (error) {
            this.logger.error('Failed to validate HMAC signature', error.message);
            return false;
        }
    }
    generateTenantSecret() {
        try {
            return crypto.randomBytes(32).toString('hex');
        }
        catch (error) {
            this.logger.error('Failed to generate tenant secret', error.message);
            throw new Error('Secret generation failed');
        }
    }
    validateRequestHeaders(headers, body, tenantSecret) {
        try {
            const signature = headers['x-misy-signature'];
            const timestamp = headers['x-misy-timestamp'];
            if (!signature || !timestamp) {
                this.logger.warn('Missing required HMAC headers');
                return false;
            }
            return this.validateSignature(body, signature, tenantSecret, timestamp, {
                tenantSecret: tenantSecret,
                timestampTolerance: this.defaultTimestampTolerance,
            });
        }
        catch (error) {
            this.logger.error('Failed to validate request headers', error.message);
            return false;
        }
    }
};
exports.HmacSignatureService = HmacSignatureService;
exports.HmacSignatureService = HmacSignatureService = HmacSignatureService_1 = __decorate([
    (0, common_1.Injectable)()
], HmacSignatureService);
//# sourceMappingURL=hmac-signature.service.js.map