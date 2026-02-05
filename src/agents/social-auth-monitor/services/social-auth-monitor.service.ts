import { Injectable, Logger } from '@nestjs/common';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { OAuthService } from '../../../oauth/oauth.service';
import { DailyCoordinatorService } from '../../daily-coordinator/services/daily-coordinator.service';
import { AgentPostSchedulerService } from '../../agent-post-scheduler/services/agent-post-scheduler.service';
import { ViralContentGeneratorService } from '../../viral-content-generator/services/viral-content-generator.service';
import {
  AccountStatusResult,
  ConnectedAccount,
} from '../interfaces/auth-monitor.interface';

@Injectable()
export class SocialAuthMonitorService {
  private readonly logger = new Logger(SocialAuthMonitorService.name);
  private readonly supportedPlatforms = [
    'instagram',
    'facebook',
    'youtube',
    'twitter',
    'linkedin',
  ];

  constructor(
    private readonly stateManager: StateManagementService,
    private readonly websocketGateway: WebSocketGatewayService,
    private readonly oauthService: OAuthService,
    private readonly dailyCoordinator: DailyCoordinatorService,
    private readonly postScheduler: AgentPostSchedulerService,
    private readonly contentGenerator: ViralContentGeneratorService,
  ) {}

  async getSocialAuthStatus() {
    this.logger.log('Obteniendo estado de autenticaci n social');

    try {
      // Obtener todas las cuentas conectadas
      const connectedAccounts = await this.oauthService.getConnectedAccounts();

      // Verificar estado de cada cuenta
      const accountStatus: any[] = [];
      for (const account of connectedAccounts) {
        const status = await this.checkAccountStatus(account);
        accountStatus.push({
          ...account,
          status,
        });
      }

      // Verificar si hay problemas
      const hasIssues = accountStatus.some(
        (acc: any) => acc.status !== 'active',
      );

      // Notificar al Daily Coordinator si hay problemas
      if (hasIssues) {
        await this.notifyDailyCoordinator(accountStatus);
      }

      // Verificar que el Scheduler y Generator puedan publicar
      const publishingStatus =
        await this.verifyPublishingCapabilities(accountStatus);

      return {
        status: 'success',
        accountStatus,
        publishingStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error obteniendo estado de autenticaci n social: ${error.message}`,
      );

      // Notificar error al Daily Coordinator
      await this.notifyDailyCoordinator(null, error.message);

      throw error;
    }
  }

  async getPlatformStatus(platform: string) {
    this.logger.log(`Obteniendo estado para plataforma: ${platform}`);

    // Validar plataforma
    if (!this.supportedPlatforms.includes(platform)) {
      throw new Error(`Plataforma no soportada: ${platform}`);
    }

    try {
      // Obtener cuentas para la plataforma espec fica
      const connectedAccounts = await this.oauthService.getConnectedAccounts();
      const platformAccounts = connectedAccounts.filter(
        (acc: ConnectedAccount) => acc.platform === platform,
      );

      // Verificar estado de cada cuenta
      const accountStatus: any[] = [];
      for (const account of platformAccounts) {
        const status = await this.checkAccountStatus(account);
        accountStatus.push({
          ...account,
          status,
        });
      }

      // Verificar capacidades de publicaci n para la plataforma
      const publishingStatus = await this.verifyPlatformPublishing(
        platform,
        accountStatus,
      );

      return {
        platform,
        accountStatus,
        publishingStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error obteniendo estado para plataforma ${platform}: ${error.message}`,
      );
      throw error;
    }
  }

  async refreshTokens(refreshData: any) {
    this.logger.log('Renovando tokens de acceso');

    const { platform, accountId } = refreshData;

    try {
      // Si se especifica una cuenta, renovar solo esa
      if (accountId) {
        const account = await this.findAccountById(accountId);
        if (!account) {
          throw new Error(`Cuenta no encontrada: ${accountId}`);
        }

        const result = await this.oauthService.refreshToken(
          account.platform,
          account.refreshToken || '',
        );
        return {
          status: 'success',
          message: 'Token renovado exitosamente',
          accountId,
          result,
          timestamp: new Date().toISOString(),
        };
      }

      // Si se especifica una plataforma, renovar todas las cuentas de esa plataforma
      if (platform) {
        const connectedAccounts =
          await this.oauthService.getConnectedAccounts();
        const platformAccounts = connectedAccounts.filter(
          (acc: ConnectedAccount) => acc.platform === platform,
        );

        const results: AccountStatusResult[] = [];
        for (const account of platformAccounts) {
          try {
            const result = await this.oauthService.refreshToken(
              account.platform,
              account.refreshToken || '',
            );
            results.push({
              accountId: account.id,
              success: true,
              result,
            });
          } catch (error) {
            results.push({
              accountId: account.id,
              success: false,
              error: error.message,
            });
          }
        }

        return {
          status: 'success',
          message: `Tokens renovados para plataforma ${platform}`,
          platform,
          results,
          timestamp: new Date().toISOString(),
        };
      }

      // Si no se especifica nada, renovar todos los tokens
      const connectedAccounts = await this.oauthService.getConnectedAccounts();
      const results: AccountStatusResult[] = [];

      for (const account of connectedAccounts) {
        try {
          const result = await this.oauthService.refreshToken(
            account.platform,
            account.refreshToken || '',
          );
          results.push({
            accountId: account.id,
            platform: account.platform,
            success: true,
            result,
          });
        } catch (error) {
          results.push({
            accountId: account.id,
            platform: account.platform,
            success: false,
            error: error.message,
          });
        }
      }

      // Verificar capacidades de publicaci n despu s de renovar tokens
      const publishingStatus = await this.verifyPublishingCapabilities(
        results
          .filter((r) => r.success)
          .map((r) => ({ platform: r.platform, id: r.accountId })),
      );

      return {
        status: 'success',
        message: 'Todos los tokens renovados',
        results,
        publishingStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error renovando tokens: ${error.message}`);
      throw error;
    }
  }

  private async findAccountById(
    accountId: string,
  ): Promise<ConnectedAccount | null> {
    const connectedAccounts = await this.oauthService.getConnectedAccounts();
    return connectedAccounts.find((acc) => acc.id === accountId) || null;
  }

  private async checkAccountStatus(account: ConnectedAccount) {
    try {
      // Verificar estado del token
      const tokenStatus = await this.oauthService.checkTokenStatus(account.id);

      // Verificar si la cuenta est  activa y el token es v lido
      if (tokenStatus.valid && tokenStatus.expiresIn > 3600) {
        // M s de 1 hora de expiraci n
        return 'active';
      } else if (tokenStatus.valid && tokenStatus.expiresIn > 0) {
        return 'expiring_soon';
      } else {
        return 'expired';
      }
    } catch (error) {
      this.logger.error(
        `Error verificando estado de cuenta ${account.id}: ${error.message}`,
      );
      return 'error';
    }
  }

  private async notifyDailyCoordinator(
    accountStatus: any[] | null,
    errorMessage?: string,
  ) {
    this.logger.log(
      'Notificando al Daily Coordinator sobre estado de autenticaci n',
    );

    try {
      // Preparar datos de notificaci n
      const notificationData = {
        type: 'social_auth_status',
        accountStatus,
        errorMessage,
        timestamp: new Date().toISOString(),
      };

      // Enviar notificaci n al Daily Coordinator
      this.websocketGateway.broadcastSystemNotification(notificationData);

      // Si hay problemas, activar soporte
      if (
        accountStatus &&
        accountStatus.some((acc: any) => acc.status !== 'active')
      ) {
        const problematicAccounts = accountStatus.filter(
          (acc: any) => acc.status !== 'active',
        );
        // Cambiar a m todo p blico
        await this.dailyCoordinator.activarSoporte(problematicAccounts);
      }

      this.logger.log('Notificaci n enviada al Daily Coordinator');
    } catch (error) {
      this.logger.error(
        `Error notificando al Daily Coordinator: ${error.message}`,
      );
    }
  }

  private async verifyPublishingCapabilities(accountStatus: any[]) {
    this.logger.log('Verificando capacidades de publicaci n');

    try {
      // Verificar que haya al menos una cuenta activa por plataforma principal
      const activePlatforms = new Set();
      for (const account of accountStatus) {
        if (account.status === 'active') {
          activePlatforms.add(account.platform);
        }
      }

      // Verificar capacidades espec ficas
      const capabilities = {
        scheduler: activePlatforms.size > 0,
        generator: activePlatforms.size > 0,
        platforms: Array.from(activePlatforms),
        message:
          activePlatforms.size > 0
            ? 'Publicaci n disponible en plataformas conectadas'
            : 'No hay plataformas disponibles para publicaci n',
      };

      // Notificar estado de publicaci n
      this.websocketGateway.broadcastSystemNotification({
        type: 'publishing_capabilities',
        capabilities,
        timestamp: new Date().toISOString(),
      });

      return capabilities;
    } catch (error) {
      this.logger.error(
        `Error verificando capacidades de publicaci n: ${error.message}`,
      );
      return {
        scheduler: false,
        generator: false,
        platforms: [],
        message: `Error verificando capacidades: ${error.message}`,
      };
    }
  }

  private async verifyPlatformPublishing(
    platform: string,
    accountStatus: any[],
  ) {
    this.logger.log(
      `Verificando capacidades de publicaci n para plataforma: ${platform}`,
    );

    try {
      // Verificar si hay cuentas activas para la plataforma
      const activeAccounts = accountStatus.filter(
        (acc: any) => acc.status === 'active',
      );

      return {
        platform,
        canPublish: activeAccounts.length > 0,
        activeAccounts: activeAccounts.length,
        message:
          activeAccounts.length > 0
            ? `Publicaci n disponible en ${activeAccounts.length} cuentas`
            : 'No hay cuentas activas para publicaci n',
      };
    } catch (error) {
      this.logger.error(
        `Error verificando publicaci n para plataforma ${platform}: ${error.message}`,
      );
      return {
        platform,
        canPublish: false,
        activeAccounts: 0,
        message: `Error verificando publicaci n: ${error.message}`,
      };
    }
  }
}
