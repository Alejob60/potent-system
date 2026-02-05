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
var ContentEditorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentEditorController = void 0;
const common_1 = require("@nestjs/common");
const content_editor_service_1 = require("../services/content-editor.service");
const edit_content_dto_1 = require("../dto/edit-content.dto");
const swagger_1 = require("@nestjs/swagger");
let ContentEditorController = ContentEditorController_1 = class ContentEditorController {
    constructor(contentEditorService) {
        this.contentEditorService = contentEditorService;
        this.logger = new common_1.Logger(ContentEditorController_1.name);
    }
    async editContent(editContentDto) {
        try {
            const result = await this.contentEditorService.editContent(editContentDto);
            const narrative = this.contentEditorService.generateNarrative(editContentDto.emotion, editContentDto.platform, result.status);
            const suggestions = this.contentEditorService.generateSuggestions(editContentDto.platform, editContentDto.emotion);
            return {
                ...result,
                narrative,
                suggestions
            };
        }
        catch (error) {
            this.logger.error('Content editing failed:', error.message);
            throw error;
        }
    }
    async getContentEditStatus(assetId) {
        const task = await this.contentEditorService.getContentEditTask(assetId);
        if (!task) {
            throw new Error('Asset not found');
        }
        const narrative = this.contentEditorService.generateNarrative(task.emotion, task.platform, task.status);
        const suggestions = this.contentEditorService.generateSuggestions(task.platform, task.emotion);
        return {
            ...task,
            narrative,
            suggestions
        };
    }
    async getContentEditTasksBySession(sessionId) {
        return this.contentEditorService.getContentEditTasksBySession(sessionId);
    }
};
exports.ContentEditorController = ContentEditorController;
__decorate([
    (0, common_1.Post)('edit'),
    (0, swagger_1.ApiOperation)({
        summary: 'Edit content asset',
        description: 'Edit a content asset according to platform requirements and emotional context',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Content editing parameters',
        schema: {
            type: 'object',
            properties: {
                assetId: { type: 'string', example: 'video123' },
                platform: { type: 'string', example: 'tiktok' },
                emotion: { type: 'string', example: 'excited' },
                campaignId: { type: 'string', example: 'cmp-456' },
                editingProfile: {
                    type: 'object',
                    properties: {
                        resolution: { type: 'string', example: '1080x1920' },
                        durationLimit: { type: 'string', example: '60' },
                        aspectRatio: { type: 'string', example: '9:16' },
                        autoSubtitles: { type: 'boolean', example: true },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['#viral', '#descubre', '#kimisoft']
                        },
                        style: { type: 'string', example: 'vibrant' }
                    }
                }
            },
            required: ['assetId', 'platform', 'emotion', 'campaignId', 'editingProfile'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Content edited successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid-123' },
                assetId: { type: 'string', example: 'video123' },
                platform: { type: 'string', example: 'tiktok' },
                emotion: { type: 'string', example: 'excited' },
                campaignId: { type: 'string', example: 'cmp-456' },
                editingProfile: { type: 'object' },
                status: { type: 'string', example: 'edited' },
                sasUrl: { type: 'string', example: 'https://storage.azure.com/assets/video123_edited.mp4?sv=...' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                narrative: { type: 'string', example: ' Tu contenido est  listo para volverse viral en tiktok!   ' },
                suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: [
                        'Considera a adir efectos de transici n din micos',
                        'Agrega texto grande y llamativo en los primeros 3 segundos',
                        'Usa m sica trending para maximizar el engagement',
                        'Incluye un CTA claro al final del video'
                    ]
                }
            }
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid parameters provided' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [edit_content_dto_1.EditContentDto]),
    __metadata("design:returntype", Promise)
], ContentEditorController.prototype, "editContent", null);
__decorate([
    (0, common_1.Get)('status/:assetId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get content edit status',
        description: 'Retrieve the editing status of a specific content asset',
    }),
    (0, swagger_1.ApiParam)({
        name: 'assetId',
        description: 'Asset ID',
        example: 'video123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Content edit status',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid-123' },
                assetId: { type: 'string', example: 'video123' },
                platform: { type: 'string', example: 'tiktok' },
                emotion: { type: 'string', example: 'excited' },
                campaignId: { type: 'string', example: 'cmp-456' },
                editingProfile: { type: 'object' },
                status: { type: 'string', example: 'edited' },
                sasUrl: { type: 'string', example: 'https://storage.azure.com/assets/video123_edited.mp4?sv=...' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                narrative: { type: 'string', example: ' Tu contenido est  listo para volverse viral en tiktok!   ' },
                suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: [
                        'Considera a adir efectos de transici n din micos',
                        'Agrega texto grande y llamativo en los primeros 3 segundos',
                        'Usa m sica trending para maximizar el engagement',
                        'Incluye un CTA claro al final del video'
                    ]
                }
            }
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentEditorController.prototype, "getContentEditStatus", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get content edit tasks by session',
        description: 'Retrieve all content editing tasks for a specific session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'session-789',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of content edit tasks',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    assetId: { type: 'string' },
                    platform: { type: 'string' },
                    emotion: { type: 'string' },
                    campaignId: { type: 'string' },
                    editingProfile: { type: 'object' },
                    status: { type: 'string' },
                    sasUrl: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                }
            }
        },
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentEditorController.prototype, "getContentEditTasksBySession", null);
exports.ContentEditorController = ContentEditorController = ContentEditorController_1 = __decorate([
    (0, swagger_1.ApiTags)('content-editor'),
    (0, common_1.Controller)('agents/content-editor'),
    __metadata("design:paramtypes", [content_editor_service_1.ContentEditorService])
], ContentEditorController);
//# sourceMappingURL=content-editor.controller.js.map