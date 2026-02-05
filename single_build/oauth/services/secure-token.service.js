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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SecureTokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureTokenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const encryption_service_1 = require("../../common/encryption.service");
const oauth_account_entity_1 = require("../entities/oauth-account.entity");
let SecureTokenService = SecureTokenService_1 = class SecureTokenService {
    oauthAccountRepo;
    refreshLogRepo;
    activityLogRepo;
    encryptionService;
    logger = new common_1.Logger(SecureTokenService_1.name);
    constructor(oauthAccountRepo, refreshLogRepo, activityLogRepo, encryptionService) {
        this.oauthAccountRepo = oauthAccountRepo;
        this.refreshLogRepo = refreshLogRepo;
        this.activityLogRepo = activityLogRepo;
        this.encryptionService = encryptionService;
    }
    /**
     * Almacena tokens OAuth de forma segura (cifrados)
     */
    async storeTokens(sessionId, platform, accessToken, refreshToken, expiresIn, userInfo, scopes = []) {
        try {
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            // Cifrar tokens antes de almacenar
            const encryptedAccessToken = this.encryptionService.encrypt(accessToken);
            const encryptedRefreshToken = refreshToken
                ? this.encryptionService.encrypt(refreshToken)
                : undefined;
            const tokenHash = this.encryptionService.hash(accessToken);
            // Buscar cuenta existente
            let account = await this.oauthAccountRepo.findOne({
                where: { sessionId, platform },
            });
            if (account) {
                // Actualizar cuenta existente
                account.encryptedAccessToken = encryptedAccessToken;
                account.encryptedRefreshToken = encryptedRefreshToken;
                account.expiresAt = expiresAt;
                account.userInfo = userInfo;
                account.scopes = scopes;
                account.tokenHash = tokenHash;
                account.isActive = true;
                account.lastUsedAt = new Date();
            }
            else {
                // Crear nueva cuenta
                account = this.oauthAccountRepo.create({
                    sessionId,
                    platform,
                    encryptedAccessToken,
                    encryptedRefreshToken,
                    expiresAt,
                    userInfo,
                    scopes,
                    tokenHash,
                    isActive: true,
                    lastUsedAt: new Date(),
                });
            }
            const savedAccount = await this.oauthAccountRepo.save(account);
            this.logger.log(`Tokens stored securely for ${platform} - Session: ${sessionId}`);
            return savedAccount;
        }
        catch (error) {
            this.logger.error(`Failed to store tokens for ${platform}:`, error.message);
            throw new Error('Failed to store OAuth tokens securely');
        }
    }
    /**
     * Recupera y descifra tokens OAuth
     */
    async getTokens(sessionId, platform) {
        try {
            const account = await this.oauthAccountRepo.findOne({
                where: { sessionId, platform, isActive: true },
            });
            if (!account) {
                return null;
            }
            // Verificar si el token ha expirado
            if (account.expiresAt < new Date()) {
                this.logger.warn(`Token expired for ${platform} - Session: ${sessionId}`);
                // Intentar refresh autom tico si hay refresh token
                if (account.encryptedRefreshToken) {
                    return await this.attemptTokenRefresh(account);
                }
                return null;
            }
            // Descifrar tokens
            const accessToken = this.encryptionService.decrypt(account.encryptedAccessToken);
            const refreshToken = account.encryptedRefreshToken
                ? this.encryptionService.decrypt(account.encryptedRefreshToken)
                : undefined;
            // Actualizar  ltimo uso
            account.lastUsedAt = new Date();
            await this.oauthAccountRepo.save(account);
            return {
                accessToken,
                refreshToken,
                expiresAt: account.expiresAt,
                platform: account.platform,
                userInfo: account.userInfo,
                scopes: account.scopes,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve tokens for ${platform}:`, error.message);
            throw new Error('Failed to retrieve OAuth tokens');
        }
    }
    /**
     * Lista todas las cuentas conectadas para una sesi n
     */
    async getConnectedAccounts(sessionId) {
        try {
            const accounts = await this.oauthAccountRepo.find({
                where: { sessionId, isActive: true },
                select: [
                    'id',
                    'platform',
                    'userInfo',
                    'expiresAt',
                    'scopes',
                    'createdAt',
                    'lastUsedAt',
                ],
            });
            return accounts.map((account) => ({
                id: account.id,
                platform: account.platform,
                userInfo: account.userInfo,
                expiresAt: account.expiresAt,
                scopes: account.scopes,
                isExpired: account.expiresAt < new Date(),
                connectedAt: account.createdAt,
                lastUsedAt: account.lastUsedAt,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to get connected accounts for session ${sessionId}:`, error.message);
            throw new Error('Failed to retrieve connected accounts');
        }
    }
    /**
     * Desconecta una cuenta espec fica
     */
    async disconnectAccount(sessionId, accountId) {
        try {
            const account = await this.oauthAccountRepo.findOne({
                where: { id: accountId, sessionId },
            });
            if (!account) {
                throw new common_1.NotFoundException('Account not found');
            }
            account.isActive = false;
            await this.oauthAccountRepo.save(account);
            this.logger.log(`Account disconnected: ${account.platform} - Session: ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Failed to disconnect account ${accountId}:`, error.message);
            throw error;
        }
    }
    /**
     * Intenta refrescar un token expirado
     */
    async attemptTokenRefresh(account) {
        const refreshLog = this.refreshLogRepo.create({
            accountId: account.id,
            platform: account.platform,
            refreshReason: 'expired',
            status: 'pending',
            oldExpiresAt: account.expiresAt,
        });
        try {
            await this.refreshLogRepo.save(refreshLog);
            // Aqu  se implementar a la l gica espec fica de refresh para cada plataforma
            // Por ahora, marcamos como fallido y retornamos null
            refreshLog.status = 'failed';
            refreshLog.errorMessage =
                'Token refresh not implemented for this platform';
            await this.refreshLogRepo.save(refreshLog);
            this.logger.warn(`Token refresh not implemented for ${account.platform}`);
            return null;
        }
        catch (error) {
            refreshLog.status = 'failed';
            refreshLog.errorMessage = error.message;
            await this.refreshLogRepo.save(refreshLog);
            this.logger.error(`Failed to refresh token for ${account.platform}:`, error.message);
            return null;
        }
    }
    /**
     * Registra actividad de integraci n
     */
    async logActivity(sessionId, accountId, logEntry) {
        try {
            const activityLog = this.activityLogRepo.create({
                accountId,
                sessionId,
                platform: logEntry.platform,
                action: logEntry.action,
                result: logEntry.result,
                metadata: logEntry.metadata || {},
                errorDetails: logEntry.errorDetails,
                executionTimeMs: logEntry.executionTimeMs,
            });
            await this.activityLogRepo.save(activityLog);
        }
        catch (error) {
            this.logger.error('Failed to log activity:', error.message);
            // No lanzamos error para no interrumpir el flujo principal
        }
    }
    /**
     * Obtiene el historial de actividad para una sesi n
     */
    async getActivityHistory(sessionId, limit = 50) {
        return await this.activityLogRepo.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    /**
     * Verifica la integridad de un token
     */
    async verifyTokenIntegrity(sessionId, platform, providedToken) {
        try {
            const account = await this.oauthAccountRepo.findOne({
                where: { sessionId, platform, isActive: true },
            });
            if (!account) {
                return false;
            }
            const providedHash = this.encryptionService.hash(providedToken);
            return this.encryptionService.safeCompare(account.tokenHash, providedHash);
        }
        catch (error) {
            this.logger.error('Token integrity verification failed:', error.message);
            return false;
        }
    }
    /**
     * Limpia tokens expirados (para ejecutar peri dicamente)
     */
    async cleanupExpiredTokens() {
        try {
            const result = await this.oauthAccountRepo.update({
                expiresAt: (0, typeorm_2.LessThan)(new Date()),
                isActive: true,
            }, { isActive: false });
            this.logger.log(`Cleaned up ${result.affected || 0} expired tokens`);
            return result.affected || 0;
        }
        catch (error) {
            this.logger.error('Failed to cleanup expired tokens:', error.message);
            return 0;
        }
    }
};
exports.SecureTokenService = SecureTokenService;
exports.SecureTokenService = SecureTokenService = SecureTokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(oauth_account_entity_1.OAuthAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(oauth_account_entity_1.OAuthRefreshLog)),
    __param(2, (0, typeorm_1.InjectRepository)(oauth_account_entity_1.IntegrationActivityLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        encryption_service_1.EncryptionService])
], SecureTokenService);
