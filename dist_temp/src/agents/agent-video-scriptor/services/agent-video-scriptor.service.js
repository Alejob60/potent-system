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
exports.AgentVideoScriptorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_video_scriptor_entity_1 = require("../entities/agent-video-scriptor.entity");
let AgentVideoScriptorService = class AgentVideoScriptorService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const script = this.generateScript(dto);
        const narrative = this.generateNarrative(dto.emotion, dto.platform);
        const suggestions = this.suggestVisuals(dto.platform, dto.format, dto.emotion);
        const compressedScript = this.compressScript(script, dto.platform);
        const visualStyle = {
            platform: dto.platform,
            format: dto.format,
            emotion: dto.emotion,
            timestamp: new Date().toISOString(),
        };
        const entity = this.repo.create({
            ...dto,
            product: JSON.stringify(dto.product),
            script: script,
            narrative: narrative,
            suggestions: JSON.stringify(suggestions),
            visualStyle: JSON.stringify(visualStyle),
            compressedScript: compressedScript,
            status: 'completed',
        });
        return this.repo.save(entity);
    }
    async findAll() {
        return this.repo.find();
    }
    async findOne(id) {
        return this.repo.findOneBy({ id });
    }
    async findBySessionId(sessionId) {
        return this.repo.find({ where: { sessionId } });
    }
    async getMetrics() {
        const total = await this.repo.count();
        const completed = await this.repo.count({ where: { status: 'completed' } });
        const failed = await this.repo.count({ where: { status: 'failed' } });
        const avgTime = 5.2;
        return {
            totalScripts: total,
            successRate: total > 0 ? (completed / total) * 100 : 0,
            failureRate: total > 0 ? (failed / total) * 100 : 0,
            averageGenerationTime: avgTime,
        };
    }
    generateScript(dto) {
        const { emotion, platform, format, product } = dto;
        const scriptTemplates = {
            tiktok: {
                unboxing: {
                    excited: ` ${product.name} est  aqu !   

[0:00-0:03]  Hola a todos! Hoy tenemos algo INCRE BLE para mostrarles

[0:03-0:08] Miren este empaque,  es tan bonito que casi no lo quiero abrir!

[0:08-0:15]  Vamos a abrirlo! *sonido de rasgado*  WOW!

[0:15-0:25] Miren estas ${product.features[0]} y ${product.features[1]}...  esto va a cambiar mi vida!

[0:25-0:30]  Listos para probarlo?  D jenme saber en los comentarios!`,
                    curious: ` Qu  hay dentro de esta caja misteriosa?   

[0:00-0:03] Hola curiosos, hoy exploramos ${product.name}

[0:03-0:08] El empaque sugiere algo especial...  ser  real?

[0:08-0:15]  Vamos a descubrirlo! *abriendo*

[0:15-0:25] ${product.features[0]}... esto es interesante.  C mo se siente en la mano?

[0:25-0:30]  Qu  opinan?  Vale la pena?`,
                    focused: `An lisis detallado de ${product.name}

[0:00-0:03] Hoy revisamos ${product.name} objetivamente

[0:03-0:08] Especificaciones clave: ${product.features.join(', ')}

[0:08-0:15] Evaluando ${product.features[0]}

[0:15-0:25] Probando ${product.features[1]}

[0:25-0:30] Conclusi n: ${product.name} ofrece valor s lido`,
                },
            },
            shorts: {
                reaction: {
                    excited: `[0:00-0:02] *reacci n sorprendida*

[0:02-0:05]  No puedo creer lo que veo!

[0:05-0:10] ${product.name} es REALMENTE incre ble

[0:10-0:15] Miren estas ${product.features[0]}

[0:15-0:20]  Han probado esto?  Es revolucionario!

[0:20-0:25] *gestos entusiasmados*

[0:25-0:30]  Suscr banse para m s!`,
                    curious: `[0:00-0:02]  Qu  es esto?

[0:02-0:05] Investigando ${product.name}

[0:05-0:10] Interesante concepto de ${product.features[0]}

[0:10-0:15]  C mo funciona?

[0:15-0:20] Miren esto...

[0:20-0:25]  Qu  opinan?

[0:25-0:30]  Merece la pena?`,
                    focused: `[0:00-0:03] Evaluaci n objetiva de ${product.name}

[0:03-0:08] An lisis de ${product.features[0]}

[0:08-0:13] Prueba de ${product.features[1]}

[0:13-0:18] Comparativa con competencia

[0:18-0:23] M tricas de rendimiento

[0:23-0:28] Conclusi n t cnica

[0:28-0:30] M s detalles en la descripci n`,
                },
            },
            reels: {
                unboxing: {
                    excited: ` UNBOXING ESPECIAL!   

[0:00-0:03]  ${product.name} lleg !

[0:03-0:08]  Est n listos?

[0:08-0:15] *abriendo*  WOW!

[0:15-0:25] ${product.features[0]} es INCRE BLE

[0:25-0:30]  Me lo llevo?`,
                    curious: ` Qu  hay aqu ?   

[0:00-0:03] Misterio por resolver

[0:03-0:08] ${product.name}  real o hype?

[0:08-0:15] *explorando*

[0:15-0:25] ${product.features[1]} me sorprende

[0:25-0:30]  Qu  piensan?`,
                    focused: `An lisis t cnico ${product.name}

[0:00-0:05] Especificaciones

[0:05-0:10] ${product.features[0]}

[0:10-0:15] Prueba pr ctica

[0:15-0:20] ${product.features[1]}

[0:20-0:25] Resultados

[0:25-0:30] Recomendaci n`,
                },
            },
        };
        const platformTemplate = scriptTemplates[platform] || scriptTemplates.tiktok;
        const formatTemplate = platformTemplate[format] || platformTemplate.unboxing;
        const emotionTemplate = formatTemplate[emotion] || formatTemplate.excited;
        return emotionTemplate;
    }
    suggestVisuals(platform, format, emotion) {
        const visualSuggestions = {
            tiktok: {
                unboxing: {
                    excited: {
                        style: 'vibrant, colorful, energetic',
                        pace: 'fast cuts, dynamic transitions',
                        effects: 'sparkles, zoom effects, text overlays',
                        music: 'upbeat, trending track',
                    },
                    curious: {
                        style: 'mysterious, soft lighting, intrigue',
                        pace: 'slow build-up, suspenseful cuts',
                        effects: 'blur transitions, question marks, dim lighting',
                        music: 'suspenseful, ambient',
                    },
                    focused: {
                        style: 'clean, professional, minimalist',
                        pace: 'steady, clear segments',
                        effects: 'text highlights, clean transitions',
                        music: 'instrumental, calm',
                    },
                },
            },
            shorts: {
                reaction: {
                    excited: {
                        style: 'expressive, exaggerated reactions',
                        pace: 'quick reactions, jump cuts',
                        effects: 'reaction emojis, speed lines',
                        music: 'energetic, punchy',
                    },
                    curious: {
                        style: 'questioning, exploratory',
                        pace: 'medium, discovery-focused',
                        effects: 'thinking bubbles, magnifying glass',
                        music: 'curious, light',
                    },
                    focused: {
                        style: 'analytical, data-driven',
                        pace: 'methodical, structured',
                        effects: 'charts, text analysis',
                        music: 'technical, neutral',
                    },
                },
            },
            reels: {
                unboxing: {
                    excited: {
                        style: 'luxury, premium feel',
                        pace: 'smooth, cinematic',
                        effects: 'glow effects, slow motion',
                        music: 'trending, emotional',
                    },
                    curious: {
                        style: 'mysterious, intriguing',
                        pace: 'teasing, suspenseful',
                        effects: 'shadow play, reveal effects',
                        music: 'mysterious, ambient',
                    },
                    focused: {
                        style: 'clean, informative',
                        pace: 'clear, structured',
                        effects: 'clean transitions, text info',
                        music: 'neutral, informative',
                    },
                },
            },
        };
        const platformSuggestion = visualSuggestions[platform] || visualSuggestions.tiktok;
        const formatSuggestion = platformSuggestion[format] || platformSuggestion.unboxing;
        const emotionSuggestion = formatSuggestion[emotion] || formatSuggestion.excited;
        return emotionSuggestion;
    }
    generateNarrative(emotion, platform) {
        const narratives = {
            excited: {
                tiktok: ' Estoy tan emocionado de compartir esto con ustedes! Este producto va a revolucionar la forma en que ven el contenido viral.  Prep rense para una experiencia  nica!',
                shorts: ' WOW! Esto es exactamente lo que necesit bamos.  El potencial viral aqu  es INCRE BLE! No puedo esperar a que lo vean todos.',
                reels: ' Esto es ESPECTACULAR! Definitivamente va a causar sensaci n.  Tengo que mostrarles cada detalle!',
            },
            curious: {
                tiktok: 'Honestamente, no s  qu  esperar de esto. Hay tantas posibilidades interesantes aqu .  Qu  creen que va a funcionar mejor?',
                shorts: 'Esto es fascinante. Hay algo aqu  que realmente capta mi atenci n. Me encantar a explorar m s a fondo con ustedes.',
                reels: 'Tengo muchas preguntas sobre esto. La curiosidad me est  comiendo vivo.  Est n tan intrigados como yo?',
            },
            focused: {
                tiktok: 'Vamos a analizar esto objetivamente. Bas ndonos en datos y m tricas, necesitamos una estrategia clara para maximizar el impacto.',
                shorts: 'Concentr monos en los hechos. La estrategia de contenido debe basarse en an lisis s lidos y objetivos medibles.',
                reels: 'Necesitamos una aproximaci n met dica. Cada elemento debe contribuir a nuestros objetivos espec ficos de engagement.',
            },
        };
        if (narratives[emotion] && narratives[emotion][platform]) {
            return narratives[emotion][platform] || '';
        }
        return narratives['excited']['tiktok'];
    }
    compressScript(script, platform) {
        const compressionRules = {
            tiktok: 0.8,
            shorts: 0.7,
            reels: 0.75,
        };
        const compressionRatio = compressionRules[platform] || 0.8;
        const lines = script.split('\n');
        const compressedLines = lines.slice(0, Math.floor(lines.length * compressionRatio));
        return compressedLines.join('\n');
    }
};
exports.AgentVideoScriptorService = AgentVideoScriptorService;
exports.AgentVideoScriptorService = AgentVideoScriptorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_video_scriptor_entity_1.AgentVideoScriptor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AgentVideoScriptorService);
//# sourceMappingURL=agent-video-scriptor.service.js.map