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
var ContentEditorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentEditorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_edit_task_entity_1 = require("../entities/content-edit-task.entity");
const axios_1 = require("@nestjs/axios");
let ContentEditorService = ContentEditorService_1 = class ContentEditorService {
    constructor(contentEditTaskRepository, httpService) {
        this.contentEditTaskRepository = contentEditTaskRepository;
        this.httpService = httpService;
        this.logger = new common_1.Logger(ContentEditorService_1.name);
    }
    async editContent(editContentDto) {
        try {
            const task = this.contentEditTaskRepository.create({
                assetId: editContentDto.assetId,
                platform: editContentDto.platform,
                emotion: editContentDto.emotion,
                campaignId: editContentDto.campaignId,
                editingProfile: editContentDto.editingProfile,
                status: content_edit_task_entity_1.ContentEditStatus.RECEIVED,
                sasUrl: '',
            });
            const savedTask = await this.contentEditTaskRepository.save(task);
            savedTask.status = content_edit_task_entity_1.ContentEditStatus.EDITING;
            await this.contentEditTaskRepository.save(savedTask);
            const isValid = await this.validateAsset(editContentDto);
            if (!isValid) {
                savedTask.status = content_edit_task_entity_1.ContentEditStatus.FAILED;
                savedTask.sasUrl = '';
                await this.contentEditTaskRepository.save(savedTask);
                throw new Error('Asset validation failed');
            }
            savedTask.status = content_edit_task_entity_1.ContentEditStatus.VALIDATED;
            await this.contentEditTaskRepository.save(savedTask);
            const editedAssetUrl = await this.callMoviePyService(editContentDto);
            const sasUrl = this.generateSasUrl(editedAssetUrl);
            savedTask.status = content_edit_task_entity_1.ContentEditStatus.EDITED;
            savedTask.sasUrl = sasUrl;
            await this.contentEditTaskRepository.save(savedTask);
            return savedTask;
        }
        catch (error) {
            this.logger.error('Failed to edit content:', error.message);
            const task = await this.contentEditTaskRepository.findOne({
                where: { assetId: editContentDto.assetId }
            });
            if (task) {
                task.status = content_edit_task_entity_1.ContentEditStatus.FAILED;
                await this.contentEditTaskRepository.save(task);
            }
            throw new Error(`Content editing failed: ${error.message}`);
        }
    }
    async validateAsset(editContentDto) {
        try {
            const platformRequirements = this.getPlatformRequirements(editContentDto.platform);
            if (editContentDto.editingProfile.resolution !== platformRequirements.resolution) {
                this.logger.warn(`Resolution mismatch for ${editContentDto.platform}`);
                return false;
            }
            if (editContentDto.editingProfile.aspectRatio !== platformRequirements.aspectRatio) {
                this.logger.warn(`Aspect ratio mismatch for ${editContentDto.platform}`);
                return false;
            }
            const durationLimit = parseInt(editContentDto.editingProfile.durationLimit);
            const platformDurationLimit = parseInt(platformRequirements.durationLimit);
            if (durationLimit > platformDurationLimit) {
                this.logger.warn(`Duration exceeds limit for ${editContentDto.platform}`);
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Asset validation failed:', error.message);
            return false;
        }
    }
    async getContentEditTask(assetId) {
        return this.contentEditTaskRepository.findOne({ where: { assetId } });
    }
    async getContentEditTasksBySession(sessionId) {
        return this.contentEditTaskRepository.find();
    }
    async updateTaskStatus(assetId, status) {
        const task = await this.contentEditTaskRepository.findOne({ where: { assetId } });
        if (task) {
            task.status = status;
            return this.contentEditTaskRepository.save(task);
        }
        return null;
    }
    generateSasUrl(url) {
        if (!url)
            return url;
        const sasToken = `sv=2020-08-04&ss=b&srt=sco&sp=rwdlacx&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=SIMULATED_SAS_SIGNATURE`;
        return url.includes('?') ? `${url}&${sasToken}` : `${url}?${sasToken}`;
    }
    generateNarrative(emotion, platform, status) {
        const narratives = {
            received: {
                excited: ' Hemos recibido tu asset! Prepar ndonos para darle un toque m gico que lo haga brillar en ' + platform,
                curious: 'Asset recibido. Explorando posibilidades creativas para ' + platform,
                focused: 'Asset en proceso. Aplicando t cnicas profesionales de edici n para ' + platform,
                default: 'Asset recibido y listo para edici n en ' + platform,
            },
            editing: {
                excited: ' Editando con pasi n! Cada corte est  dise ado para maximizar el impacto en ' + platform,
                curious: 'En proceso de edici n. Experimentando con efectos que cautivar n a tu audiencia en ' + platform,
                focused: 'Edici n t cnica en curso. Optimizando cada frame para resultados profesionales en ' + platform,
                default: 'Edici n en progreso para ' + platform,
            },
            validated: {
                excited: ' Perfecto! Tu asset cumple con todos los requisitos de ' + platform + '.  A darle vida!',
                curious: 'Validaci n completada. El asset cumple con los est ndares de ' + platform,
                focused: 'Requisitos t cnicos verificados. Listo para edici n avanzada en ' + platform,
                default: 'Asset validado para ' + platform,
            },
            edited: {
                excited: ' Tu contenido est  listo para volverse viral en ' + platform + '!   ',
                curious: 'Edici n completada. El asset est  optimizado para ' + platform,
                focused: 'Edici n finalizada. Contenido listo para publicaci n en ' + platform,
                default: 'Asset editado y preparado para ' + platform,
            },
            failed: {
                excited: ' Ups! Encontramos un peque o obst culo en la edici n. Nuestro equipo lo est  revisando para que pronto brille en ' + platform,
                curious: 'La edici n encontr  algunos desaf os. Estamos investigando soluciones para ' + platform,
                focused: 'Error en edici n. Revisando requisitos t cnicos para ' + platform,
                default: 'Edici n fallida para ' + platform + '. Reintentando...',
            },
        };
        const statusNarratives = narratives[status] || narratives.received;
        return statusNarratives[emotion] || statusNarratives.default;
    }
    generateSuggestions(platform, emotion) {
        const suggestions = {
            tiktok: {
                excited: [
                    'Considera a adir efectos de transici n din micos',
                    'Agrega texto grande y llamativo en los primeros 3 segundos',
                    'Usa m sica trending para maximizar el engagement',
                    'Incluye un CTA claro al final del video'
                ],
                curious: [
                    'Prueba con efectos de revelaci n para mantener la intriga',
                    'Usa preguntas visuales para involucrar a la audiencia',
                    'A ade subt tulos para mejorar la accesibilidad',
                    'Considera crear una serie de contenido relacionado'
                ],
                focused: [
                    'Mant n una estructura clara con introducci n, desarrollo y cierre',
                    'Usa gr ficos limpios y profesionales',
                    'Incluye datos o estad sticas relevantes',
                    'Optimiza el video para sonido apagado con elementos visuales claros'
                ]
            },
            instagram: {
                excited: [
                    'A ade stickers interactivos para aumentar el engagement',
                    'Usa una combinaci n de fotos y videos en el carrusel',
                    'Incluye una descripci n atractiva con hashtags relevantes',
                    'Considera usar Reels para contenido m s din mico'
                ],
                curious: [
                    'Crea historias con encuestas o preguntas para involucrar',
                    'Usa filtros sutiles que complementen tu contenido',
                    'A ade elementos interactivos en las historias',
                    'Considera las tendencias de Instagram para tu nicho'
                ],
                focused: [
                    'Mant n una est tica coherente en tu feed',
                    'Usa una paleta de colores consistente',
                    'Incluye informaci n valiosa en las descripciones',
                    'Optimiza los primeros segundos para captar atenci n'
                ]
            },
            youtube: {
                excited: [
                    'Crea una miniatura atractiva que invite a hacer clic',
                    'Usa palabras clave relevantes en el t tulo y descripci n',
                    'Incluye llamados a la acci n durante el video',
                    'Considera crear una serie para fidelizar suscriptores'
                ],
                curious: [
                    'Desarrolla una narrativa que invite a explorar m s',
                    'Incluye enlaces relevantes en la descripci n',
                    'Usa tarjetas y pantallas finales para guiar a los espectadores',
                    'Crea contenido que invite a comentarios y discusi n'
                ],
                focused: [
                    'Estructura el contenido con secciones claras',
                    'Usa gr ficos y presentaciones profesionales',
                    'Incluye referencias y fuentes confiables',
                    'Optimiza la duraci n seg n el tema y audiencia objetivo'
                ]
            }
        };
        return suggestions[platform]?.[emotion] || [
            'Revisa las mejores pr cticas para ' + platform,
            'Considera el timing  ptimo para publicar en ' + platform,
            'Aseg rate de que el contenido se adapte al estilo de ' + platform,
            'Prueba diferentes enfoques para ver qu  resuena mejor'
        ];
    }
    getPlatformRequirements(platform) {
        const requirements = {
            tiktok: {
                resolution: '1080x1920',
                durationLimit: '60',
                aspectRatio: '9:16',
                format: 'mp4'
            },
            instagram: {
                resolution: '1080x1080',
                durationLimit: '60',
                aspectRatio: '1:1',
                format: 'mp4'
            },
            youtube: {
                resolution: '1920x1080',
                durationLimit: '600',
                aspectRatio: '16:9',
                format: 'mp4'
            }
        };
        return requirements[platform] || requirements.tiktok;
    }
    async callMoviePyService(editContentDto) {
        try {
            return `https://storage.azure.com/assets/${editContentDto.assetId}_edited.mp4`;
        }
        catch (error) {
            this.logger.error('MoviePy service call failed:', error.message);
            throw new Error(`MoviePy service error: ${error.message}`);
        }
    }
};
exports.ContentEditorService = ContentEditorService;
exports.ContentEditorService = ContentEditorService = ContentEditorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_edit_task_entity_1.ContentEditTask)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        axios_1.HttpService])
], ContentEditorService);
//# sourceMappingURL=content-editor.service.js.map