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
exports.CreativeSynthesizerController = void 0;
const common_1 = require("@nestjs/common");
const creative_synthesizer_service_1 = require("../services/creative-synthesizer.service");
const create_content_dto_1 = require("../dto/create-content.dto");
const publish_content_dto_1 = require("../dto/publish-content.dto");
const swagger_1 = require("@nestjs/swagger");
let CreativeSynthesizerController = class CreativeSynthesizerController {
    constructor(creativeSynthesizerService) {
        this.creativeSynthesizerService = creativeSynthesizerService;
    }
    async processCreation(createContentDto) {
        try {
            return await this.creativeSynthesizerService.processCreationRequest(createContentDto);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to process creation request: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async publishContent(publishContentDto) {
        try {
            return await this.creativeSynthesizerService.publishContent(publishContentDto);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to publish content: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCreationStatus() {
        try {
            return await this.creativeSynthesizerService.getCreationStatus();
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve creation status: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCreationsBySession(sessionId) {
        try {
            return await this.creativeSynthesizerService.getCreationsBySession(sessionId);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve creations by session: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllCreations() {
        try {
            return await this.creativeSynthesizerService.findAll();
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve all creations: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCreationById(id) {
        try {
            return await this.creativeSynthesizerService.findOne(id);
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: `Failed to retrieve creation by ID: ${error.message}`,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CreativeSynthesizerController = CreativeSynthesizerController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Process content creation request',
        description: 'Receive context and generate multimedia content based on intention',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Content creation parameters',
        type: create_content_dto_1.CreateContentDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Content creation request received and queued',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'processing' },
                creationId: { type: 'string', example: 'creation-123' },
                message: {
                    type: 'string',
                    example: 'Content creation request received and queued for processing',
                },
                sessionId: { type: 'string', example: 'user-session-123' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_content_dto_1.CreateContentDto]),
    __metadata("design:returntype", Promise)
], CreativeSynthesizerController.prototype, "processCreation", null);
__decorate([
    (0, common_1.Post)('publish'),
    (0, swagger_1.ApiOperation)({
        summary: 'Publish content to external platform',
        description: 'Publish generated content to connected external platform',
    }),
    (0, swagger_1.ApiBody)({
        description: 'Content publishing parameters',
        type: publish_content_dto_1.PublishContentDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Content publish request received and queued',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'publishing' },
                assetId: { type: 'string', example: 'asset-123' },
                message: {
                    type: 'string',
                    example: 'Content publish request received and queued for processing',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_content_dto_1.PublishContentDto]),
    __metadata("design:returntype", Promise)
], CreativeSynthesizerController.prototype, "publishContent", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get creation status and metrics',
        description: 'Retrieve metrics for content generation (time, success, failures)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Creation status and metrics',
        schema: {
            type: 'object',
            properties: {
                timestamp: { type: 'string', format: 'date-time' },
                statistics: {
                    type: 'object',
                    properties: {
                        totalCreations: { type: 'number' },
                        processingCreations: { type: 'number' },
                        completedCreations: { type: 'number' },
                        failedCreations: { type: 'number' },
                        avgGenerationTime: { type: 'number' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CreativeSynthesizerController.prototype, "getCreationStatus", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get creations by session',
        description: 'Retrieve all creations associated with a session',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sessionId',
        description: 'Session ID',
        example: 'user-session-123',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of session creations',
    }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreativeSynthesizerController.prototype, "getCreationsBySession", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all creations',
        description: 'Retrieve all content creations',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all creations',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CreativeSynthesizerController.prototype, "getAllCreations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get creation by ID',
        description: 'Retrieve a specific creation by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Creation ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Creation details',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreativeSynthesizerController.prototype, "getCreationById", null);
exports.CreativeSynthesizerController = CreativeSynthesizerController = __decorate([
    (0, swagger_1.ApiTags)('creative-synthesizer'),
    (0, common_1.Controller)('agents/creative-synthesizer'),
    __metadata("design:paramtypes", [creative_synthesizer_service_1.CreativeSynthesizerService])
], CreativeSynthesizerController);
//# sourceMappingURL=creative-synthesizer.controller.js.map