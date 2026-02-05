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
var ContentCreationWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentCreationWorker = void 0;
const common_1 = require("@nestjs/common");
const creative_synthesizer_service_1 = require("../services/creative-synthesizer.service");
let ContentCreationWorker = ContentCreationWorker_1 = class ContentCreationWorker {
    constructor(creativeSynthesizerService) {
        this.creativeSynthesizerService = creativeSynthesizerService;
        this.logger = new common_1.Logger(ContentCreationWorker_1.name);
    }
    async processContentCreationRequest(message) {
        const { creationId, intention, entities } = message;
        this.logger.log(`Processing content creation request: ${creationId}`);
        try {
            await this.simulateProcessingTime(intention);
            const result = await this.generateContent(intention, entities);
            await this.creativeSynthesizerService.updateCreationStatus(creationId, 'completed', result.assetUrl, result.generationTime, result.qualityScore);
            this.logger.log(`Content creation completed successfully: ${creationId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process content creation: ${creationId}`, error.stack);
            await this.creativeSynthesizerService.updateCreationStatus(creationId, 'failed');
        }
    }
    async processContentPublishRequest(message) {
        const { assetId, integrationId, caption, tags } = message;
        this.logger.log(`Processing content publish request: ${assetId}`);
        try {
            await this.simulatePublishingTime();
            const result = await this.publishContent(assetId, integrationId, caption, tags);
            await this.creativeSynthesizerService.updateCreationStatus(assetId, 'published', result.publishedUrl, result.publishTime, result.engagementScore);
            this.logger.log(`Content published successfully: ${assetId}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish content: ${assetId}`, error.stack);
            await this.creativeSynthesizerService.updateCreationStatus(assetId, 'failed');
        }
    }
    async simulateProcessingTime(intention) {
        const processingTimes = {
            generate_video: 120000,
            generate_image: 30000,
            generate_audio: 60000,
        };
        const time = processingTimes[intention] || 60000;
        await new Promise((resolve) => setTimeout(resolve, time));
    }
    async simulatePublishingTime() {
        await new Promise((resolve) => setTimeout(resolve, 15000));
    }
    async generateContent(intention, entities) {
        const baseUrl = 'https://realculturestorage.blob.core.windows.net';
        switch (intention) {
            case 'generate_video':
                return {
                    assetUrl: `${baseUrl}/videos/generated-video-${Date.now()}.mp4`,
                    generationTime: 120,
                    qualityScore: Math.floor(Math.random() * 40) + 60,
                };
            case 'generate_image':
                return {
                    assetUrl: `${baseUrl}/images/generated-image-${Date.now()}.png`,
                    generationTime: 30,
                    qualityScore: Math.floor(Math.random() * 40) + 60,
                };
            case 'generate_audio':
                return {
                    assetUrl: `${baseUrl}/audio/generated-audio-${Date.now()}.mp3`,
                    generationTime: 60,
                    qualityScore: Math.floor(Math.random() * 40) + 60,
                };
            default:
                throw new Error(`Unsupported intention: ${intention}`);
        }
    }
    async publishContent(assetId, integrationId, caption, tags) {
        const platforms = {
            tiktok: 'TikTok',
            meta: 'Facebook/Instagram',
            google: 'YouTube',
        };
        const platform = platforms[integrationId] || 'Unknown Platform';
        return {
            publishedUrl: `https://${platform.toLowerCase()}.com/content/${assetId}`,
            publishTime: 15,
            engagementScore: Math.floor(Math.random() * 50) + 50,
        };
    }
};
exports.ContentCreationWorker = ContentCreationWorker;
exports.ContentCreationWorker = ContentCreationWorker = ContentCreationWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [creative_synthesizer_service_1.CreativeSynthesizerService])
], ContentCreationWorker);
//# sourceMappingURL=content-creation.worker.js.map