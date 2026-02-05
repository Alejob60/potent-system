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
exports.KnowledgeInjectorController = void 0;
const common_1 = require("@nestjs/common");
const knowledge_injector_service_1 = require("../services/knowledge-injector.service");
const swagger_1 = require("@nestjs/swagger");
let KnowledgeInjectorController = class KnowledgeInjectorController {
    constructor(service) {
        this.service = service;
    }
    async trainAgents(trainingData) {
        return this.service.trainAgents(trainingData);
    }
};
exports.KnowledgeInjectorController = KnowledgeInjectorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Entrena agentes creativos con t cnicas avanzadas',
        description: 'Entrena agentes creativos con datasets de campa as virales, manuales de dise o emocional y estrategias de marketing oscuro',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Datos de entrenamiento para los agentes',
        schema: {
            type: 'object',
            properties: {
                dataset: {
                    type: 'array',
                    items: { type: 'object' },
                    example: [
                        {
                            campaign: 'Ejemplo de campa a viral',
                            metrics: { engagement: 95 },
                        },
                    ],
                },
                designManuals: {
                    type: 'array',
                    items: { type: 'object' },
                    example: [
                        {
                            principle: 'Dise o emocional',
                            techniques: ['contraste', 'jerarqu a'],
                        },
                    ],
                },
                darkStrategies: {
                    type: 'array',
                    items: { type: 'object' },
                    example: [
                        {
                            strategy: 'Urgencia',
                            techniques: ['temporizador', 'edici n limitada'],
                        },
                    ],
                },
                targetAgents: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['video-scriptor', 'trend-scanner'],
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Agentes entrenados exitosamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos de entrenamiento inv lidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KnowledgeInjectorController.prototype, "trainAgents", null);
exports.KnowledgeInjectorController = KnowledgeInjectorController = __decorate([
    (0, swagger_1.ApiTags)('agents'),
    (0, common_1.Controller)('agents/train'),
    __metadata("design:paramtypes", [knowledge_injector_service_1.KnowledgeInjectorService])
], KnowledgeInjectorController);
//# sourceMappingURL=knowledge-injector.controller.js.map