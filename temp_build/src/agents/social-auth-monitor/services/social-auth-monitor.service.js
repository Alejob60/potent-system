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
var SocialAuthMonitorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAuthMonitorService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const oauth_service_1 = require("../../../oauth/oauth.service");
const daily_coordinator_service_1 = require("../../daily-coordinator/services/daily-coordinator.service");
const agent_post_scheduler_service_1 = require("../../agent-post-scheduler/services/agent-post-scheduler.service");
const viral_content_generator_service_1 = require("../../viral-content-generator/services/viral-content-generator.service");
let SocialAuthMonitorService = SocialAuthMonitorService_1 = class SocialAuthMonitorService {
    constructor(stateManager, websocketGateway, oauthService, dailyCoordinator, postScheduler, contentGenerator) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.oauthService = oauthService;
        this.dailyCoordinator = dailyCoordinator;
        this.postScheduler = postScheduler;
        this.contentGenerator = contentGenerator;
        this.logger = new common_1.Logger(SocialAuthMonitorService_1.name);
        this.supportedPlatforms = [
            'instagram',
            'facebook',
            'youtube',
            'twitter',
            'linkedin',
        ];
    }
    async getSocialAuthStatus() {
        this.logger.log('Obteniendo estado de autenticaci n social');
        try {
            const connectedAccounts = await this.oauthService.getConnectedAccounts();
            const accountStatus = [];
            for (const account of connectedAccounts) {
                const status = await this.checkAccountStatus(account);
                accountStatus.push({
                    ...account,
                    status,
                });
            }
            const hasIssues = accountStatus.some((acc) => acc.status !== 'active');
            if (hasIssues) {
                await this.notifyDailyCoordinator(accountStatus);
            }
            const publishingStatus = await this.verifyPublishingCapabilities(accountStatus);
            return {
                status: 'success',
                accountStatus,
                publishingStatus,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Error obteniendo estado de autenticaci n social: ${error.message}`);
            await this.notifyDailyCoordinator(null, error.message);
            throw error;
        }
    }
    async getPlatformStatus(platform) {
        this.logger.log(`Obteniendo estado para plataforma: ${platform}`);
        if (!this.supportedPlatforms.includes(platform)) {
            throw new Error(`Plataforma no soportada: ${platform}`);
        }
        try {
            const connectedAccounts = await this.oauthService.getConnectedAccounts();
            const platformAccounts = connectedAccounts.filter((acc) => acc.platform === platform);
            const accountStatus = [];
            for (const account of platformAccounts) {
                const status = await this.checkAccountStatus(account);
                accountStatus.push({
                    ...account,
                    status,
                });
            }
            const publishingStatus = await this.verifyPlatformPublishing(platform, accountStatus);
            return {
                platform,
                accountStatus,
                publishingStatus,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Error obteniendo estado para plataforma ${platform}: ${error.message}`);
            throw error;
        }
    }
    async refreshTokens(refreshData) {
        this.logger.log('Renovando tokens de acceso');
        const { platform, accountId } = refreshData;
        try {
            if (accountId) {
                const account = await this.findAccountById(accountId);
                if (!account) {
                    throw new Error(`Cuenta no encontrada: ${accountId}`);
                }
                const result = await this.oauthService.refreshToken(account.platform, account.refreshToken || '');
                return {
                    status: 'success',
                    message: 'Token renovado exitosamente',
                    accountId,
                    result,
                    timestamp: new Date().toISOString(),
                };
            }
            if (platform) {
                const connectedAccounts = await this.oauthService.getConnectedAccounts();
                const platformAccounts = connectedAccounts.filter((acc) => acc.platform === platform);
                const results = [];
                for (const account of platformAccounts) {
                    try {
                        const result = await this.oauthService.refreshToken(account.platform, account.refreshToken || '');
                        results.push({
                            accountId: account.id,
                            success: true,
                            result,
                        });
                    }
                    catch (error) {
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
            const connectedAccounts = await this.oauthService.getConnectedAccounts();
            const results = [];
            for (const account of connectedAccounts) {
                try {
                    const result = await this.oauthService.refreshToken(account.platform, account.refreshToken || '');
                    results.push({
                        accountId: account.id,
                        platform: account.platform,
                        success: true,
                        result,
                    });
                }
                catch (error) {
                    results.push({
                        accountId: account.id,
                        platform: account.platform,
                        success: false,
                        error: error.message,
                    });
                }
            }
            const publishingStatus = await this.verifyPublishingCapabilities(results
                .filter((r) => r.success)
                .map((r) => ({ platform: r.platform, id: r.accountId })));
            return {
                status: 'success',
                message: 'Todos los tokens renovados',
                results,
                publishingStatus,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error(`Error renovando tokens: ${error.message}`);
            throw error;
        }
    }
    async findAccountById(accountId) {
        const connectedAccounts = await this.oauthService.getConnectedAccounts();
        return connectedAccounts.find((acc) => acc.id === accountId) || null;
    }
    async checkAccountStatus(account) {
        try {
            const tokenStatus = await this.oauthService.checkTokenStatus(account.id);
            if (tokenStatus.valid && tokenStatus.expiresIn > 3600) {
                return 'active';
            }
            else if (tokenStatus.valid && tokenStatus.expiresIn > 0) {
                return 'expiring_soon';
            }
            else {
                return 'expired';
            }
        }
        catch (error) {
            this.logger.error(`Error verificando estado de cuenta ${account.id}: ${error.message}`);
            return 'error';
        }
    }
    async notifyDailyCoordinator(accountStatus, errorMessage) {
        this.logger.log('Notificando al Daily Coordinator sobre estado de autenticaci n');
        try {
            const notificationData = {
                type: 'social_auth_status',
                accountStatus,
                errorMessage,
                timestamp: new Date().toISOString(),
            };
            this.websocketGateway.broadcastSystemNotification(notificationData);
            if (accountStatus &&
                accountStatus.some((acc) => acc.status !== 'active')) {
                const problematicAccounts = accountStatus.filter((acc) => acc.status !== 'active');
                await this.dailyCoordinator.activarSoporte(problematicAccounts);
            }
            this.logger.log('Notificaci n enviada al Daily Coordinator');
        }
        catch (error) {
            this.logger.error(`Error notificando al Daily Coordinator: ${error.message}`);
        }
    }
    async verifyPublishingCapabilities(accountStatus) {
        this.logger.log('Verificando capacidades de publicaci n');
        try {
            const activePlatforms = new Set();
            for (const account of accountStatus) {
                if (account.status === 'active') {
                    activePlatforms.add(account.platform);
                }
            }
            const capabilities = {
                scheduler: activePlatforms.size > 0,
                generator: activePlatforms.size > 0,
                platforms: Array.from(activePlatforms),
                message: activePlatforms.size > 0
                    ? 'Publicaci n disponible en plataformas conectadas'
                    : 'No hay plataformas disponibles para publicaci n',
            };
            this.websocketGateway.broadcastSystemNotification({
                type: 'publishing_capabilities',
                capabilities,
                timestamp: new Date().toISOString(),
            });
            return capabilities;
        }
        catch (error) {
            this.logger.error(`Error verificando capacidades de publicaci n: ${error.message}`);
            return {
                scheduler: false,
                generator: false,
                platforms: [],
                message: `Error verificando capacidades: ${error.message}`,
            };
        }
    }
    async verifyPlatformPublishing(platform, accountStatus) {
        this.logger.log(`Verificando capacidades de publicaci n para plataforma: ${platform}`);
        try {
            const activeAccounts = accountStatus.filter((acc) => acc.status === 'active');
            return {
                platform,
                canPublish: activeAccounts.length > 0,
                activeAccounts: activeAccounts.length,
                message: activeAccounts.length > 0
                    ? `Publicaci n disponible en ${activeAccounts.length} cuentas`
                    : 'No hay cuentas activas para publicaci n',
            };
        }
        catch (error) {
            this.logger.error(`Error verificando publicaci n para plataforma ${platform}: ${error.message}`);
            return {
                platform,
                canPublish: false,
                activeAccounts: 0,
                message: `Error verificando publicaci n: ${error.message}`,
            };
        }
    }
};
exports.SocialAuthMonitorService = SocialAuthMonitorService;
exports.SocialAuthMonitorService = SocialAuthMonitorService = SocialAuthMonitorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        oauth_service_1.OAuthService,
        daily_coordinator_service_1.DailyCoordinatorService,
        agent_post_scheduler_service_1.AgentPostSchedulerService,
        viral_content_generator_service_1.ViralContentGeneratorService])
], SocialAuthMonitorService);
//# sourceMappingURL=social-auth-monitor.service.js.map