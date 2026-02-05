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
var ViralContentGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralContentGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const state_management_service_1 = require("../../../state/state-management.service");
const websocket_gateway_1 = require("../../../websocket/websocket.gateway");
const agent_video_scriptor_service_1 = require("../../agent-video-scriptor/services/agent-video-scriptor.service");
const agent_post_scheduler_service_1 = require("../../agent-post-scheduler/services/agent-post-scheduler.service");
let ViralContentGeneratorService = ViralContentGeneratorService_1 = class ViralContentGeneratorService {
    constructor(stateManager, websocketGateway, videoScriptor, postScheduler) {
        this.stateManager = stateManager;
        this.websocketGateway = websocketGateway;
        this.videoScriptor = videoScriptor;
        this.postScheduler = postScheduler;
        this.logger = new common_1.Logger(ViralContentGeneratorService_1.name);
    }
    async generateViralContent(contentData) {
        this.logger.log('Generando contenido viral multiformato');
        const { context } = contentData;
        if (!context) {
            throw new Error('Datos de contenido inv lidos');
        }
        this.websocketGateway.broadcastSystemNotification({
            type: 'content_generation_started',
            context,
            timestamp: new Date().toISOString(),
        });
        let generatedContent = null;
        switch (context.objective) {
            case 'create_viral_video':
                generatedContent = await this.generateVideoContent(context);
                break;
            case 'create_viral_image':
                generatedContent = await this.generateImageContent(context);
                break;
            case 'create_viral_meme':
                generatedContent = await this.generateMemeContent(context);
                break;
            case 'create_viral_post':
                generatedContent = await this.generatePostContent(context);
                break;
            case 'generate_tags':
                generatedContent = await this.generateTagsContent(context);
                break;
            default:
                throw new Error(`Objetivo de contenido no soportado: ${context.objective}`);
        }
        await this.coordinarConAgentes(generatedContent, context);
        const asset = await this.saveToRepository(generatedContent, context);
        this.stateManager.addTask(context.sessionId, {
            type: 'content_generation',
            status: 'completed',
            data: {
                content: generatedContent,
                asset,
            },
        });
        return {
            status: 'success',
            message: 'Contenido viral generado exitosamente',
            content: generatedContent,
            asset,
            timestamp: new Date().toISOString(),
        };
    }
    async coordinarConAgentes(content, context) {
        this.logger.log('Coordinando con agentes Scriptor y Scheduler');
        try {
            if (context.objective === 'create_viral_video') {
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_coordination',
                    agents: ['video-scriptor'],
                    contentId: content.id,
                    message: 'Iniciando coordinaci n con Video Scriptor',
                });
            }
            if ([
                'create_viral_post',
                'create_viral_image',
                'create_viral_meme',
            ].includes(context.objective)) {
                const schedulerDto = {
                    content: content.copy || content.text,
                    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                };
                const scheduledPost = await this.postScheduler.create(schedulerDto);
                this.websocketGateway.broadcastSystemNotification({
                    type: 'agent_coordination',
                    agents: ['post-scheduler'],
                    contentId: content.id,
                    scheduledPostId: scheduledPost.id,
                    message: 'Contenido programado con Post Scheduler',
                });
                this.stateManager.addConversationEntry(context.sessionId, {
                    type: 'system_event',
                    content: 'Contenido programado para publicaci n',
                    metadata: {
                        contentId: content.id,
                        scheduledPostId: scheduledPost.id,
                        scheduledAt: scheduledPost.scheduledAt,
                    },
                });
            }
        }
        catch (error) {
            this.logger.error(`Error en coordinaci n con agentes: ${error.message}`);
        }
    }
    async generateVideoContent(context) {
        this.logger.log('Generando contenido de video viral');
        try {
            const script = await this.videoScriptor.create({
                sessionId: `session-${Date.now()}`,
                emotion: context.emotionalGoal,
                platform: context.trend.platform,
                format: 'unboxing',
                objective: 'viral_content',
                product: {
                    name: context.trend.name,
                    features: [
                        'caracter stica viral 1',
                        'caracter stica viral 2',
                        'caracter stica viral 3',
                    ],
                },
            });
            const videoContent = {
                id: `video-${Date.now()}`,
                title: `Video viral sobre ${context.trend.name}`,
                script: script.script,
                platform: context.trend.platform,
                emotionalNarrative: context.emotionalGoal,
                voiceClone: this.generateVoiceClone(context),
                duration: this.calculateOptimalDuration(context),
                format: 'mp4',
                resolution: '1080p',
                aspectRatio: this.calculateAspectRatio(context.trend.platform),
                subtitles: true,
                music: true,
                effects: this.generateEffects(context.emotionalGoal),
            };
            return videoContent;
        }
        catch (error) {
            this.logger.error(`Error generando video: ${error.message}`);
            throw error;
        }
    }
    generateVoiceClone(context) {
        const voiceProfiles = {
            humor: 'energetic_male',
            education: 'calm_female',
            controversy: 'dramatic_male',
            emotion: 'warm_female',
        };
        return voiceProfiles[context.emotionalGoal] || 'default_voice';
    }
    calculateOptimalDuration(context) {
        const durationMap = {
            tiktok: '15s-30s',
            instagram: '30s-60s',
            youtube: '60s-120s',
        };
        return durationMap[context.trend.platform] || '30s-60s';
    }
    calculateAspectRatio(platform) {
        const aspectRatios = {
            tiktok: '9:16',
            instagram: '4:5',
            youtube: '16:9',
        };
        return aspectRatios[platform] || '9:16';
    }
    generateEffects(emotionalGoal) {
        const effectPresets = {
            humor: ['quick_cuts', 'text_overlays', 'sound_effects'],
            education: ['smooth_transitions', 'info_graphics', 'calm_colors'],
            controversy: ['dramatic_lighting', 'intense_music', 'bold_text'],
            emotion: ['soft_lighting', 'emotional_music', 'close_ups'],
        };
        return effectPresets[emotionalGoal] || ['basic_effects'];
    }
    async generateImageContent(context) {
        this.logger.log('Generando contenido de imagen viral');
        const imageContent = {
            id: `image-${Date.now()}`,
            title: `Imagen viral sobre ${context.trend.name}`,
            text: ` No te pierdas la  ltima tendencia en ${context.trend.name}!`,
            style: context.trend.platform,
            emotionalTone: context.emotionalGoal,
            format: 'png',
            size: '1080x1080',
            filters: this.generateImageFilters(context.emotionalGoal),
            textPosition: 'center',
            font: this.selectOptimalFont(context.emotionalGoal),
        };
        return imageContent;
    }
    generateImageFilters(emotionalGoal) {
        const filterPresets = {
            humor: ['bright', 'saturated', 'comic_style'],
            education: ['clean', 'professional', 'minimal'],
            controversy: ['high_contrast', 'dramatic', 'bold'],
            emotion: ['warm', 'soft', 'pastel'],
        };
        return filterPresets[emotionalGoal] || ['standard'];
    }
    selectOptimalFont(emotionalGoal) {
        const fontPresets = {
            humor: 'Comic Sans MS',
            education: 'Arial',
            controversy: 'Impact',
            emotion: 'Georgia',
        };
        return fontPresets[emotionalGoal] || 'Arial';
    }
    async generateMemeContent(context) {
        this.logger.log('Generando contenido de meme viral');
        const memeContent = {
            id: `meme-${Date.now()}`,
            title: `Meme viral sobre ${context.trend.name}`,
            text: `Cuando ves la tendencia de ${context.trend.name}`,
            culturalReference: context.trend.name,
            emotionalTone: context.emotionalGoal,
            format: 'jpg',
            template: this.selectMemeTemplate(context.emotionalGoal),
            overlayText: true,
            watermark: false,
        };
        return memeContent;
    }
    selectMemeTemplate(emotionalGoal) {
        const templatePresets = {
            humor: 'drake_pointing',
            education: 'confused_math',
            controversy: 'mocking_spongebob',
            emotion: 'distracted_boyfriend',
        };
        return templatePresets[emotionalGoal] || 'standard_meme';
    }
    async generatePostContent(context) {
        this.logger.log('Generando contenido de post viral');
        const postContent = {
            id: `post-${Date.now()}`,
            title: `Post viral sobre ${context.trend.name}`,
            copy: ` Incre ble tendencia en ${context.trend.name}!   

 Ya la conoces?  Es viral!   

#${context.trend.name.replace(/\s+/g, '')} #TendenciaViral`,
            platform: context.trend.platform,
            emotionalTone: context.emotionalGoal,
            callToAction: 'Ver m s',
            emojis: this.generateEmojis(context.emotionalGoal),
            mentions: [],
        };
        return postContent;
    }
    generateEmojis(emotionalGoal) {
        const emojiPresets = {
            humor: ['  ', '  ', '  ', '  '],
            education: ['  ', '  ', '  ', '  '],
            controversy: ['  ', '  ', ' ', '  '],
            emotion: ['  ', '  ', '  ', '  '],
        };
        return emojiPresets[emotionalGoal] || [' ', '  ', '  '];
    }
    async generateTagsContent(context) {
        this.logger.log('Generando tags y hashtags optimizados');
        const tagsContent = {
            id: `tags-${Date.now()}`,
            hashtags: [
                `#${context.trend.name.replace(/\s+/g, '')}`,
                '#TendenciaViral',
                '#ContenidoViral',
                `#${context.trend.platform}`,
                '#MisyBot',
            ],
            tags: [
                context.trend.name,
                'viral',
                context.trend.platform,
                context.emotionalGoal,
            ],
            optimizedFor: context.trend.platform,
            trendingTags: this.generateTrendingTags(context.trend),
        };
        return tagsContent;
    }
    generateTrendingTags(trend) {
        return [
            `#${trend.name.replace(/\s+/g, '')}Challenge`,
            `#${trend.name.replace(/\s+/g, '')}Viral`,
            `#${trend.platform}${trend.name.replace(/\s+/g, '')}`,
        ];
    }
    async saveToRepository(content, context) {
        this.logger.log('Guardando contenido en repositorio versionado');
        const asset = {
            id: `asset-${Date.now()}`,
            contentId: content.id,
            type: context.objective,
            createdAt: new Date().toISOString(),
            version: '1.0.0',
            metadata: {
                trend: context.trend,
                emotionalGoal: context.emotionalGoal,
                platform: context.trend.platform,
            },
            content: content,
            repositoryPath: `/assets/${context.trend.platform}/${context.objective}/${content.id}`,
            tags: [
                context.trend.name,
                context.trend.platform,
                context.emotionalGoal,
                context.objective,
            ],
        };
        this.stateManager.addConversationEntry(context.sessionId, {
            type: 'system_event',
            content: 'Contenido guardado en repositorio versionado',
            metadata: {
                asset,
                saveTime: new Date().toISOString(),
                repositoryPath: asset.repositoryPath,
            },
        });
        this.websocketGateway.broadcastSystemNotification({
            type: 'content_saved',
            assetId: asset.id,
            contentId: content.id,
            repositoryPath: asset.repositoryPath,
            message: 'Contenido guardado exitosamente en repositorio versionado',
        });
        return asset;
    }
};
exports.ViralContentGeneratorService = ViralContentGeneratorService;
exports.ViralContentGeneratorService = ViralContentGeneratorService = ViralContentGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [state_management_service_1.StateManagementService,
        websocket_gateway_1.WebSocketGatewayService,
        agent_video_scriptor_service_1.AgentVideoScriptorService,
        agent_post_scheduler_service_1.AgentPostSchedulerService])
], ViralContentGeneratorService);
//# sourceMappingURL=viral-content-generator.service.js.map