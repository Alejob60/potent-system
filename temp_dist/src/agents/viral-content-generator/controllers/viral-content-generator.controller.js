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
exports.ViralContentGeneratorController = void 0;
const common_1 = require("@nestjs/common");
const viral_content_generator_service_1 = require("../services/viral-content-generator.service");
const swagger_1 = require("@nestjs/swagger");
let ViralContentGeneratorController = class ViralContentGeneratorController {
    constructor(service) {
        this.service = service;
    }
    async generateContent(contentData) {
        return this.service.generateViralContent(contentData);
    }
};
exports.ViralContentGeneratorController = ViralContentGeneratorController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Genera contenido viral multiformato',
        description: 'Produce contenido viral en todos los formatos: video, imagen, meme, post, tags',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Datos para generaci n de contenido viral',
        schema: {
            type: 'object',
            properties: {
                context: {
                    type: 'object',
                    properties: {
                        sessionId: { type: 'string', example: 'user-session-123' },
                        trend: {
                            type: 'object',
                            example: {
                                id: 'trend-123',
                                name: 'Nueva tendencia viral',
                                platform: 'tiktok',
                            },
                        },
                        objective: {
                            type: 'string',
                            example: 'create_viral_video',
                        },
                        emotionalGoal: {
                            type: 'string',
                            example: 'humor',
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Contenido viral generado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inv lidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViralContentGeneratorController.prototype, "generateContent", null);
exports.ViralContentGeneratorController = ViralContentGeneratorController = __decorate([
    (0, swagger_1.ApiTags)('content'),
    (0, common_1.Controller)('content/generate'),
    __metadata("design:paramtypes", [viral_content_generator_service_1.ViralContentGeneratorService])
], ViralContentGeneratorController);
//# sourceMappingURL=viral-content-generator.controller.js.map