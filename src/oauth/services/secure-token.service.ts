import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EncryptionService } from '../../common/encryption.service';
import {
  OAuthAccount,
  OAuthRefreshLog,
  IntegrationActivityLog,
} from '../entities/oauth-account.entity';

export interface SecureTokenInfo {
  accessToken: string; // Descifrado solo en memoria
  refreshToken?: string;
  expiresAt: Date;
  platform: string;
  userInfo: any;
  scopes: string[];
}

export interface ActivityLogEntry {
  action: string;
  platform: string;
  result: 'success' | 'error' | 'pending';
  metadata?: any;
  errorDetails?: any;
  executionTimeMs?: number;
}

@Injectable()
export class SecureTokenService {
  private readonly logger = new Logger(SecureTokenService.name);

  constructor(
    @InjectRepository(OAuthAccount)
    private readonly oauthAccountRepo: Repository<OAuthAccount>,

    @InjectRepository(OAuthRefreshLog)
    private readonly refreshLogRepo: Repository<OAuthRefreshLog>,

    @InjectRepository(IntegrationActivityLog)
    private readonly activityLogRepo: Repository<IntegrationActivityLog>,

    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Almacena tokens OAuth de forma segura (cifrados)
   */
  async storeTokens(
    sessionId: string,
    platform: string,
    accessToken: string,
    refreshToken: string | undefined,
    expiresIn: number,
    userInfo: any,
    scopes: string[] = [],
  ): Promise<OAuthAccount> {
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
      } else {
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

      this.logger.log(
        `Tokens stored securely for ${platform} - Session: ${sessionId}`,
      );

      return savedAccount;
    } catch (error) {
      this.logger.error(
        `Failed to store tokens for ${platform}:`,
        error.message,
      );
      throw new Error('Failed to store OAuth tokens securely');
    }
  }

  /**
   * Recupera y descifra tokens OAuth
   */
  async getTokens(
    sessionId: string,
    platform: string,
  ): Promise<SecureTokenInfo | null> {
    try {
      const account = await this.oauthAccountRepo.findOne({
        where: { sessionId, platform, isActive: true },
      });

      if (!account) {
        return null;
      }

      // Verificar si el token ha expirado
      if (account.expiresAt < new Date()) {
        this.logger.warn(
          `Token expired for ${platform} - Session: ${sessionId}`,
        );

        // Intentar refresh autom tico si hay refresh token
        if (account.encryptedRefreshToken) {
          return await this.attemptTokenRefresh(account);
        }

        return null;
      }

      // Descifrar tokens
      const accessToken = this.encryptionService.decrypt(
        account.encryptedAccessToken,
      );
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
    } catch (error) {
      this.logger.error(
        `Failed to retrieve tokens for ${platform}:`,
        error.message,
      );
      throw new Error('Failed to retrieve OAuth tokens');
    }
  }

  /**
   * Lista todas las cuentas conectadas para una sesi n
   */
  async getConnectedAccounts(sessionId: string): Promise<any[]> {
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
    } catch (error) {
      this.logger.error(
        `Failed to get connected accounts for session ${sessionId}:`,
        error.message,
      );
      throw new Error('Failed to retrieve connected accounts');
    }
  }

  /**
   * Desconecta una cuenta espec fica
   */
  async disconnectAccount(sessionId: string, accountId: string): Promise<void> {
    try {
      const account = await this.oauthAccountRepo.findOne({
        where: { id: accountId, sessionId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      account.isActive = false;
      await this.oauthAccountRepo.save(account);

      this.logger.log(
        `Account disconnected: ${account.platform} - Session: ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to disconnect account ${accountId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Intenta refrescar un token expirado
   */
  private async attemptTokenRefresh(
    account: OAuthAccount,
  ): Promise<SecureTokenInfo | null> {
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
    } catch (error) {
      refreshLog.status = 'failed';
      refreshLog.errorMessage = error.message;
      await this.refreshLogRepo.save(refreshLog);

      this.logger.error(
        `Failed to refresh token for ${account.platform}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Registra actividad de integraci n
   */
  async logActivity(
    sessionId: string,
    accountId: string,
    logEntry: ActivityLogEntry,
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to log activity:', error.message);
      // No lanzamos error para no interrumpir el flujo principal
    }
  }

  /**
   * Obtiene el historial de actividad para una sesi n
   */
  async getActivityHistory(
    sessionId: string,
    limit: number = 50,
  ): Promise<IntegrationActivityLog[]> {
    return await this.activityLogRepo.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Verifica la integridad de un token
   */
  async verifyTokenIntegrity(
    sessionId: string,
    platform: string,
    providedToken: string,
  ): Promise<boolean> {
    try {
      const account = await this.oauthAccountRepo.findOne({
        where: { sessionId, platform, isActive: true },
      });

      if (!account) {
        return false;
      }

      const providedHash = this.encryptionService.hash(providedToken);
      return this.encryptionService.safeCompare(
        account.tokenHash,
        providedHash,
      );
    } catch (error) {
      this.logger.error('Token integrity verification failed:', error.message);
      return false;
    }
  }

  /**
   * Limpia tokens expirados (para ejecutar peri dicamente)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await this.oauthAccountRepo.update(
        {
          expiresAt: LessThan(new Date()),
          isActive: true,
        },
        { isActive: false },
      );

      this.logger.log(`Cleaned up ${result.affected || 0} expired tokens`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Failed to cleanup expired tokens:', error.message);
      return 0;
    }
  }
}
