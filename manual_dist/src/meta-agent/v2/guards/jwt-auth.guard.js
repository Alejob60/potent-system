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
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    constructor() {
        this.logger = new common_1.Logger(JwtAuthGuard_1.name);
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        if (this.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
            this.logger.warn('⚠️ Using default JWT secret. Change JWT_SECRET in production!');
        }
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader) {
            this.logger.warn('Missing Authorization header');
            throw new common_1.UnauthorizedException('Missing Authorization header');
        }
        if (!authHeader.startsWith('Bearer ')) {
            this.logger.warn('Invalid Authorization header format');
            throw new common_1.UnauthorizedException('Invalid Authorization header format');
        }
        const token = authHeader.substring(7);
        try {
            const payload = jwt.verify(token, this.jwtSecret);
            if (!payload.sub || !payload.tenantId) {
                this.logger.warn('Invalid JWT payload: missing required fields');
                throw new common_1.UnauthorizedException('Invalid token: missing required fields');
            }
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                this.logger.warn(`Token expired for user ${payload.sub}`);
                throw new common_1.UnauthorizedException('Token has expired');
            }
            request.user = payload;
            this.logger.debug(`JWT validated for user ${payload.sub}, tenant ${payload.tenantId}`);
            return true;
        }
        catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                this.logger.warn(`Invalid JWT signature: ${error.message}`);
                throw new common_1.UnauthorizedException('Invalid token signature');
            }
            if (error instanceof jwt.TokenExpiredError) {
                this.logger.warn('Token has expired');
                throw new common_1.UnauthorizedException('Token has expired');
            }
            this.logger.error(`JWT validation error: ${error.message}`);
            throw new common_1.UnauthorizedException('Token validation failed');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map