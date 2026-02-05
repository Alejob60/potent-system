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
var ViralizationRouteEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralizationRouteEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const viralization_route_entity_1 = require("../entities/viralization-route.entity");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let ViralizationRouteEngineService = ViralizationRouteEngineService_1 = class ViralizationRouteEngineService {
    constructor(routeRepository, httpService) {
        this.routeRepository = routeRepository;
        this.httpService = httpService;
        this.logger = new common_1.Logger(ViralizationRouteEngineService_1.name);
    }
    async activateRoute(activateRouteDto, userId) {
        try {
            const route = this.routeRepository.create({
                routeType: activateRouteDto.routeType,
                sessionId: activateRouteDto.sessionId,
                userId,
                emotion: activateRouteDto.emotion,
                platforms: activateRouteDto.platforms,
                agents: activateRouteDto.agents,
                schedule: {
                    start: new Date(activateRouteDto.schedule.start),
                    end: new Date(activateRouteDto.schedule.end),
                },
                stages: activateRouteDto.agents.map((agent, index) => ({
                    order: index + 1,
                    agent,
                    status: 'pending',
                })),
                currentStage: 1,
                status: 'initiated',
                metadata: activateRouteDto.metadata || {},
            });
            const savedRoute = await this.routeRepository.save(route);
            await this.executeStage(savedRoute.id, 1);
            return {
                status: 'route_activated',
                routeId: savedRoute.id,
                message: 'Viralization route activated successfully',
                sessionId: activateRouteDto.sessionId,
            };
        }
        catch (error) {
            this.logger.error('Failed to activate viralization route:', error.message);
            throw new Error(`Failed to activate viralization route: ${error.message}`);
        }
    }
    async executeStage(routeId, stageOrder) {
        try {
            const route = await this.routeRepository.findOne({
                where: { id: routeId },
            });
            if (!route) {
                throw new Error('Route not found');
            }
            const stage = route.stages.find((s) => s.order === stageOrder);
            if (!stage) {
                throw new Error(`Stage ${stageOrder} not found`);
            }
            const stageStatus = this.getStageStatus(stage.agent, 'processing');
            stage.status = stageStatus;
            stage.startedAt = new Date();
            route.currentStage = stageOrder;
            route.status = stageStatus;
            await this.routeRepository.save(route);
            let output;
            switch (stage.agent) {
                case 'trend-scanner':
                    output = await this.executeTrendScannerStage(route);
                    break;
                case 'video-scriptor':
                    output = await this.executeVideoScriptorStage(route);
                    break;
                case 'creative-synthesizer':
                    output = await this.executeCreativeSynthesizerStage(route);
                    break;
                case 'post-scheduler':
                    output = await this.executePostSchedulerStage(route);
                    break;
                case 'analytics-reporter':
                    output = await this.executeAnalyticsReporterStage(route);
                    break;
                default:
                    throw new Error(`Unsupported agent: ${stage.agent}`);
            }
            const completedStatus = this.getStageStatus(stage.agent, 'completed');
            stage.status = completedStatus;
            stage.completedAt = new Date();
            stage.output = this.addEmotionalNarrative(output, route.emotion, stage.agent, 'completed');
            const nextStage = route.stages.find((s) => s.order === stageOrder + 1);
            if (nextStage) {
                route.currentStage = stageOrder + 1;
                route.status = this.getRouteStatusForNextStage(nextStage.agent);
            }
            else {
                route.status = 'completed';
            }
            await this.routeRepository.save(route);
            if (nextStage) {
                setTimeout(() => {
                    this.executeStage(routeId, stageOrder + 1);
                }, 1000);
            }
            else {
                this.notifyFrontDeskRouteCompletion(route);
            }
            this.logger.log(`Stage ${stageOrder} completed successfully for route ${routeId}`);
        }
        catch (error) {
            const route = await this.routeRepository.findOne({
                where: { id: routeId },
            });
            if (route) {
                const stage = route.stages.find((s) => s.order === stageOrder);
                if (stage) {
                    stage.status = 'failed';
                    stage.completedAt = new Date();
                }
                route.status = 'failed';
                await this.routeRepository.save(route);
            }
            this.logger.error(`Failed to execute stage ${stageOrder} for route ${routeId}:`, error.message);
            throw error;
        }
    }
    async getRouteStatus(routeId) {
        const route = await this.routeRepository.findOne({
            where: { id: routeId },
        });
        if (!route) {
            throw new Error('Route not found');
        }
        return {
            routeId: route.id,
            routeType: route.routeType,
            status: route.status,
            currentStage: route.currentStage,
            stages: route.stages,
            metrics: route.metrics,
            createdAt: route.createdAt,
            updatedAt: route.updatedAt,
        };
    }
    async getAllRoutesBySession(sessionId) {
        return this.routeRepository.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
        });
    }
    async updateRouteMetrics(routeId, metrics) {
        const route = await this.routeRepository.findOne({
            where: { id: routeId },
        });
        if (route) {
            route.metrics = { ...route.metrics, ...metrics };
            await this.routeRepository.save(route);
        }
    }
    async executeTrendScannerStage(route) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.AGENT_TREND_SCANNER_URL || 'http://localhost:3007/api/agents/trend-scanner'}/scan`, {
                sessionId: route.sessionId,
                platforms: route.platforms,
                emotion: route.emotion,
            }));
            return {
                ...response.data,
                emotion: route.emotion,
            };
        }
        catch (error) {
            this.logger.error('Failed to execute Trend Scanner stage:', error.message);
            throw new Error(`Trend Scanner stage failed: ${error.message}`);
        }
    }
    async executeVideoScriptorStage(route) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.AGENT_VIDEO_SCRIPTOR_URL || 'http://localhost:3007/api/agents/video-scriptor'}/generate-script`, {
                sessionId: route.sessionId,
                emotion: route.emotion,
                platforms: route.platforms,
                trendData: route.stages.find((s) => s.agent === 'trend-scanner')
                    ?.output,
            }));
            return {
                ...response.data,
                emotion: route.emotion,
            };
        }
        catch (error) {
            this.logger.error('Failed to execute Video Scriptor stage:', error.message);
            throw new Error(`Video Scriptor stage failed: ${error.message}`);
        }
    }
    async executeCreativeSynthesizerStage(route) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.BACKEND_URL || 'http://localhost:3007'}/api/agents/creative-synthesizer`, {
                sessionId: route.sessionId,
                userId: route.userId,
                intention: 'generate_video',
                emotion: route.emotion,
                entities: {
                    script: route.stages.find((s) => s.agent === 'video-scriptor')
                        ?.output?.script,
                    style: route.platforms[0],
                    duration: 30,
                },
                integrationId: route.platforms[0],
                integrationStatus: 'active',
            }));
            return {
                ...response.data,
                emotion: route.emotion,
            };
        }
        catch (error) {
            this.logger.error('Failed to execute Creative Synthesizer stage:', error.message);
            throw new Error(`Creative Synthesizer stage failed: ${error.message}`);
        }
    }
    async executePostSchedulerStage(route) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.AGENT_POST_SCHEDULER_URL || 'http://localhost:3007/api/agents/post-scheduler'}/schedule`, {
                sessionId: route.sessionId,
                platforms: route.platforms,
                content: route.stages.find((s) => s.agent === 'creative-synthesizer')?.output,
                schedule: route.schedule,
            }));
            return {
                ...response.data,
                emotion: route.emotion,
            };
        }
        catch (error) {
            this.logger.error('Failed to execute Post Scheduler stage:', error.message);
            throw new Error(`Post Scheduler stage failed: ${error.message}`);
        }
    }
    async executeAnalyticsReporterStage(route) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${process.env.AGENT_ANALYTICS_REPORTER_URL || 'http://localhost:3007/api/agents/analytics-reporter'}/generate-report`, {
                sessionId: route.sessionId,
                platforms: route.platforms,
                contentId: route.stages.find((s) => s.agent === 'creative-synthesizer')?.output?.creationId,
                period: {
                    start: route.schedule.start,
                    end: route.schedule.end,
                },
            }));
            return {
                ...response.data,
                emotion: route.emotion,
            };
        }
        catch (error) {
            this.logger.error('Failed to execute Analytics Reporter stage:', error.message);
            throw new Error(`Analytics Reporter stage failed: ${error.message}`);
        }
    }
    getStageStatus(agent, state) {
        const statusMap = {
            'trend-scanner': {
                processing: 'scanning',
                completed: 'scanned',
                failed: 'scan_failed',
            },
            'video-scriptor': {
                processing: 'scripting',
                completed: 'scripted',
                failed: 'script_failed',
            },
            'creative-synthesizer': {
                processing: 'generating',
                completed: 'generated',
                failed: 'generation_failed',
                publishing: 'publishing',
                published: 'published',
            },
            'post-scheduler': {
                processing: 'scheduling',
                completed: 'scheduled',
                failed: 'schedule_failed',
            },
            'analytics-reporter': {
                processing: 'analyzing',
                completed: 'analyzed',
                failed: 'analysis_failed',
            },
        };
        return statusMap[agent]?.[state] || state;
    }
    getRouteStatusForNextStage(agent) {
        const statusMap = {
            'trend-scanner': 'scanning',
            'video-scriptor': 'scripting',
            'creative-synthesizer': 'generating',
            'post-scheduler': 'scheduling',
            'analytics-reporter': 'analyzing',
        };
        return statusMap[agent] || 'processing';
    }
    addEmotionalNarrative(output, emotion, agent, status) {
        if (output && output.narrative) {
            return output;
        }
        const narratives = {
            'trend-scanner': {
                completed: {
                    excited: ' Hemos identificado las tendencias m s virales para tu campa a!   ',
                    curious: 'An lisis de tendencias completado, listo para inspirar tu contenido.',
                    focused: 'Tendencias relevantes identificadas con precisi n.',
                    default: 'An lisis de tendencias completado exitosamente.',
                },
            },
            'video-scriptor': {
                completed: {
                    excited: ' Tu gui n est  listo para cautivar audiencias!   ',
                    curious: 'Gui n creado con historias que conectan emocionalmente.',
                    focused: 'Narrativa estructurada con impacto garantizado.',
                    default: 'Gui n generado exitosamente.',
                },
            },
            'creative-synthesizer': {
                completed: {
                    excited: ' Tu contenido est  listo para viralizarse!   ',
                    curious: 'Contenido multimedia creado con estilo  nico.',
                    focused: 'Asset generado con precisi n art stica.',
                    default: 'Contenido generado exitosamente.',
                },
                published: {
                    excited: ' Tu contenido ha sido publicado y est  generando engagement!   ',
                    curious: 'Publicaci n completada, listo para monitorear resultados.',
                    focused: 'Contenido publicado seg n estrategia definida.',
                    default: 'Contenido publicado exitosamente.',
                },
            },
            'post-scheduler': {
                completed: {
                    excited: ' Tu calendario de publicaci n est  optimizado para m ximo impacto!   ',
                    curious: 'Calendario creado para maximizar alcance y engagement.',
                    focused: 'Programaci n estrat gica establecida.',
                    default: 'Calendario de publicaci n generado exitosamente.',
                },
            },
            'analytics-reporter': {
                completed: {
                    excited: ' Tus m tricas muestran un rendimiento excepcional!   ',
                    curious: 'An lisis completo con insights valiosos para optimizaci n.',
                    focused: 'M tricas precisas para toma de decisiones informada.',
                    default: 'Reporte anal tico generado exitosamente.',
                },
            },
        };
        let narrative = '';
        if (narratives[agent] &&
            narratives[agent][status] &&
            narratives[agent][status][emotion]) {
            narrative = narratives[agent][status][emotion];
        }
        else if (narratives[agent] &&
            narratives[agent][status] &&
            narratives[agent][status]['default']) {
            narrative = narratives[agent][status]['default'];
        }
        else {
            narrative = 'Etapa completada exitosamente.';
        }
        const suggestions = this.generateContextualSuggestions(agent, status);
        return {
            ...output,
            narrative,
            suggestions,
            ...(output?.assetUrl
                ? { assetUrl: this.generateSasUrl(output.assetUrl) }
                : {}),
        };
    }
    generateContextualSuggestions(agent, status) {
        const suggestions = {
            'trend-scanner': {
                completed: [
                    'Revisa las tendencias identificadas para ajustar tu mensaje',
                    'Considera combinar varias tendencias para mayor impacto',
                    'Analiza el timing  ptimo para cada plataforma',
                ],
            },
            'video-scriptor': {
                completed: [
                    'Refina el gui n con base en tu audiencia objetivo',
                    'Considera variaciones para diferentes plataformas',
                    'Agrega llamados a la acci n espec ficos',
                ],
            },
            'creative-synthesizer': {
                completed: [
                    'Revisa la calidad del contenido generado',
                    'Considera crear variaciones para A/B testing',
                    'Programa la publicaci n para horarios de mayor engagement',
                ],
                published: [
                    'Monitorea el rendimiento de tu publicaci n',
                    'Interact a con los comentarios de tu audiencia',
                    'Comparte en otros canales para maximizar alcance',
                ],
            },
            'post-scheduler': {
                completed: [
                    'Verifica que todas las publicaciones est n correctamente programadas',
                    'Prepara respuestas para comentarios esperados',
                    'Considera ajustes seg n el performance inicial',
                ],
            },
            'analytics-reporter': {
                completed: [
                    'Analiza las m tricas para identificar oportunidades',
                    'Compara el performance entre diferentes plataformas',
                    'Usa los insights para optimizar futuras campa as',
                ],
            },
        };
        return (suggestions[agent]?.[status] || [
            'Contin a con la siguiente etapa del proceso',
        ]);
    }
    generateSasUrl(url) {
        if (!url)
            return url;
        const sasToken = `sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE`;
        return url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
    }
    async notifyFrontDeskRouteCompletion(route) {
        try {
            this.logger.log(`Route ${route.id} completed. Notifying Front Desk.`);
        }
        catch (error) {
            this.logger.error('Failed to notify Front Desk of route completion:', error.message);
        }
    }
};
exports.ViralizationRouteEngineService = ViralizationRouteEngineService;
exports.ViralizationRouteEngineService = ViralizationRouteEngineService = ViralizationRouteEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(viralization_route_entity_1.ViralizationRoute)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        axios_1.HttpService])
], ViralizationRouteEngineService);
//# sourceMappingURL=viralization-route-engine.service.js.map