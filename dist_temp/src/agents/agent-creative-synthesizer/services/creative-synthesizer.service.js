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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreativeSynthesizerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const creative_synthesizer_entity_1 = require("../entities/creative-synthesizer.entity");
const microservices_1 = require("@nestjs/microservices");
const typeorm_3 = require("typeorm");
let CreativeSynthesizerService = class CreativeSynthesizerService {
    constructor(creationRepository, serviceBusClient) {
        this.creationRepository = creationRepository;
        this.serviceBusClient = serviceBusClient;
    }
    async processCreationRequest(createContentDto) {
        try {
            const creationRecord = this.creationRepository.create({
                sessionId: createContentDto.sessionId,
                userId: createContentDto.userId,
                intention: createContentDto.intention,
                emotion: createContentDto.emotion,
                entities: createContentDto.entities,
                integrationId: createContentDto.integrationId,
                integrationStatus: createContentDto.integrationStatus,
                status: 'processing',
                metadata: {
                    startTime: new Date(),
                },
            });
            const savedRecord = await this.creationRepository.save(creationRecord);
            const message = {
                creationId: savedRecord.id,
                ...createContentDto,
            };
            this.serviceBusClient.emit('content_creation_request', message);
            return {
                status: 'processing',
                creationId: savedRecord.id,
                message: 'Content creation request received and queued for processing',
                sessionId: createContentDto.sessionId,
            };
        }
        catch (error) {
            throw new Error(`Failed to process creation request: ${error.message}`);
        }
    }
    async publishContent(publishContentDto) {
        try {
            const creationRecord = await this.creationRepository.findOne({
                where: { id: publishContentDto.assetId },
            });
            if (!creationRecord) {
                throw new Error('Creation record not found');
            }
            creationRecord.status = 'publishing';
            await this.creationRepository.save(creationRecord);
            const message = {
                ...publishContentDto,
                creationRecord,
            };
            this.serviceBusClient.emit('content_publish_request', message);
            const notification = {
                creationId: publishContentDto.assetId,
                status: 'publishing',
                assetUrl: creationRecord.assetUrl,
                sessionId: creationRecord.sessionId,
                narrative: this.generateEmotionalNarrative('publishing', creationRecord.intention, creationRecord.emotion),
                suggestions: this.generateSuggestions('publishing', creationRecord.intention),
            };
            this.serviceBusClient.emit('content_publish_started', notification);
            return {
                status: 'publishing',
                assetId: publishContentDto.assetId,
                message: 'Content publish request received and queued for processing',
                narrative: notification.narrative,
                suggestions: notification.suggestions,
            };
        }
        catch (error) {
            const creationRecord = await this.creationRepository.findOne({
                where: { id: publishContentDto.assetId },
            });
            if (creationRecord) {
                creationRecord.status = 'failed';
                await this.creationRepository.save(creationRecord);
                const errorNotification = {
                    creationId: publishContentDto.assetId,
                    status: 'failed',
                    assetUrl: creationRecord.assetUrl,
                    sessionId: creationRecord.sessionId,
                    narrative: this.generateEmotionalNarrative('failed', creationRecord.intention, creationRecord.emotion),
                    suggestions: this.generateSuggestions('failed', creationRecord.intention),
                };
                this.serviceBusClient.emit('content_publish_failed', errorNotification);
            }
            throw new Error(`Failed to publish content: ${error.message}`);
        }
    }
    async getCreationsBySession(sessionId) {
        return this.creationRepository.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
        });
    }
    async getCreationStatus() {
        const totalCreations = await this.creationRepository.count();
        const processingCreations = await this.creationRepository.count({
            where: { status: 'processing' },
        });
        const completedCreations = await this.creationRepository.count({
            where: { status: 'completed' },
        });
        const failedCreations = await this.creationRepository.count({
            where: { status: 'failed' },
        });
        const allCreations = await this.creationRepository.find({
            where: {
                generationTime: (0, typeorm_3.Not)((0, typeorm_3.IsNull)()),
            },
        });
        const avgGenerationTime = allCreations.length > 0
            ? allCreations.reduce((sum, creation) => sum + creation.generationTime, 0) / allCreations.length
            : 0;
        return {
            timestamp: new Date().toISOString(),
            statistics: {
                totalCreations,
                processingCreations,
                completedCreations,
                failedCreations,
                avgGenerationTime: Math.round(avgGenerationTime * 100) / 100,
            },
        };
    }
    async updateCreationStatus(creationId, status, assetUrl, generationTime, qualityScore) {
        try {
            const creationRecord = await this.creationRepository.findOne({
                where: { id: creationId },
            });
            if (creationRecord) {
                creationRecord.status = status;
                if (assetUrl)
                    creationRecord.assetUrl = this.generateSasUrl(assetUrl);
                if (generationTime)
                    creationRecord.generationTime = generationTime;
                if (qualityScore)
                    creationRecord.qualityScore = qualityScore;
                creationRecord.metadata = {
                    ...creationRecord.metadata,
                    endTime: new Date(),
                    processingTime: generationTime,
                };
                await this.creationRepository.save(creationRecord);
                const notification = {
                    creationId,
                    status,
                    assetUrl: creationRecord.assetUrl,
                    sessionId: creationRecord.sessionId,
                    narrative: this.generateEmotionalNarrative(status, creationRecord.intention, creationRecord.emotion),
                    suggestions: this.generateSuggestions(status, creationRecord.intention),
                };
                this.serviceBusClient.emit('content_creation_completed', notification);
            }
        }
        catch (error) {
            console.error('Failed to update creation status:', error.message);
        }
    }
    async findAll() {
        return this.creationRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        return this.creationRepository.findOneBy({ id });
    }
    generateSasUrl(url) {
        const sasToken = `sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE`;
        return url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
    }
    generateEmotionalNarrative(status, intention, emotion) {
        const narratives = {
            completed: {
                generate_video: {
                    excited: ' Tu video est  listo para inspirar confianza y generar engagement!    ',
                    curious: 'Tu video ha sido creado con  xito, listo para compartir con tu audiencia.   ',
                    focused: 'Video completado con precisi n, tal como lo imaginaste.   ',
                    default: 'Tu video ha sido generado exitosamente.  Listo para viralizar!   ',
                },
                generate_image: {
                    excited: ' Tu imagen est  lista para cautivar corazones y generar likes!     ',
                    curious: 'Imagen creada con  xito, lista para ser compartida.   ',
                    focused: 'Imagen completada con precisi n art stica.   ',
                    default: 'Tu imagen ha sido generada exitosamente.  Perfecta para publicar!   ',
                },
                generate_audio: {
                    excited: ' Tu audio est  listo para emocionar y conectar con tu audiencia!    ',
                    curious: 'Audio creado con  xito, listo para ser escuchado.   ',
                    focused: 'Audio completado con la calidad que buscabas.   ',
                    default: 'Tu audio ha sido generado exitosamente.  Listo para compartir!   ',
                },
            },
            failed: {
                default: 'Lo sentimos, hubo un problema al generar tu contenido. Nuestro equipo est  trabajando para resolverlo.    ',
            },
            published: {
                default: ' Tu contenido ha sido publicado exitosamente!   ',
            },
        };
        if (narratives[status] &&
            narratives[status][intention] &&
            narratives[status][intention][emotion]) {
            return narratives[status][intention][emotion];
        }
        if (narratives[status] &&
            narratives[status][intention] &&
            narratives[status][intention]['default']) {
            return narratives[status][intention]['default'];
        }
        if (narratives[status] && narratives[status]['default']) {
            return narratives[status]['default'];
        }
        return 'Tu contenido est  en proceso de generaci n.   ';
    }
    generateSuggestions(status, intention) {
        const suggestions = {
            completed: {
                generate_video: [
                    'Considera agregar subt tulos para mayor alcance',
                    'Programa la publicaci n para horarios de mayor engagement',
                    'Comparte en m ltiples plataformas para maximizar impacto',
                ],
                generate_image: [
                    'Agrega un llamado a la acci n en tu publicaci n',
                    'Usa hashtags relevantes para aumentar visibilidad',
                    'Considera crear una serie de im genes relacionadas',
                ],
                generate_audio: [
                    'Agrega una descripci n atractiva para acompa ar el audio',
                    'Comparte en plataformas especializadas en audio',
                    'Considera crear una versi n visual del contenido',
                ],
                default: [
                    'Revisa la calidad del contenido antes de publicar',
                    'Considera programar la publicaci n para mejor engagement',
                    'Comparte en m ltiples plataformas',
                ],
            },
            failed: {
                default: [
                    'Intenta nuevamente con una configuraci n diferente',
                    'Verifica que toda la informaci n requerida est  completa',
                    'Contacta a soporte si el problema persiste',
                ],
            },
            published: {
                default: [
                    'Monitorea el rendimiento de tu publicaci n',
                    'Interact a con los comentarios de tu audiencia',
                    'Considera crear contenido relacionado',
                ],
            },
        };
        if (suggestions[status] && suggestions[status][intention]) {
            return suggestions[status][intention];
        }
        if (suggestions[status] && suggestions[status]['default']) {
            return suggestions[status]['default'];
        }
        return ['Contin a interactuando con el sistema para mejores resultados'];
    }
};
exports.CreativeSynthesizerService = CreativeSynthesizerService;
exports.CreativeSynthesizerService = CreativeSynthesizerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(creative_synthesizer_entity_1.CreativeSynthesizerCreation)),
    __param(1, (0, common_1.Inject)('ServiceBusClient')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        microservices_1.ClientProxy])
], CreativeSynthesizerService);
//# sourceMappingURL=creative-synthesizer.service.js.map