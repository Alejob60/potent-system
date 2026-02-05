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
exports.MediaHandlingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const media_handling_service_1 = require("./media-handling.service");
let MediaHandlingController = class MediaHandlingController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async uploadMedia(file, maxSize, allowedTypes, generateThumbnail, expirationDays) {
        try {
            if (!file) {
                return {
                    success: false,
                    error: 'No file provided',
                };
            }
            let parsedAllowedTypes;
            if (allowedTypes) {
                parsedAllowedTypes = allowedTypes.split(',');
            }
            const options = {};
            if (maxSize)
                options.maxSize = maxSize;
            if (parsedAllowedTypes)
                options.allowedTypes = parsedAllowedTypes;
            if (generateThumbnail !== undefined)
                options.generateThumbnail = generateThumbnail;
            if (expirationDays)
                options.expirationDays = expirationDays;
            const result = await this.mediaService.uploadMedia(file.buffer, file.originalname, file.mimetype, options);
            if (result.success) {
                return {
                    success: true,
                    fileId: result.fileId,
                    url: result.url,
                    thumbnailUrl: result.thumbnailUrl,
                    metadata: result.metadata,
                    message: 'Media file uploaded successfully',
                };
            }
            else {
                return {
                    success: false,
                    error: result.error,
                    message: 'Failed to upload media file',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to upload media file',
            };
        }
    }
    async getMediaFile(fileId) {
        try {
            const data = this.mediaService.getMediaFile(fileId);
            if (data) {
                return {
                    success: true,
                    data,
                    message: 'Media file retrieved successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'File not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve media file',
            };
        }
    }
    async deleteMediaFile(fileId) {
        try {
            const result = this.mediaService.deleteMediaFile(fileId);
            if (result) {
                return {
                    success: true,
                    message: 'Media file deleted successfully',
                };
            }
            else {
                return {
                    success: false,
                    message: 'File not found',
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to delete media file',
            };
        }
    }
    async getAllMediaFiles() {
        try {
            const data = this.mediaService.getAllMediaFiles();
            return {
                success: true,
                data,
                message: 'Media files retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve media files',
            };
        }
    }
    async cleanupExpiredFiles() {
        try {
            const data = this.mediaService.cleanupExpiredFiles();
            return {
                success: true,
                data,
                message: `Cleaned up ${data} expired media files`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to clean up expired media files',
            };
        }
    }
};
exports.MediaHandlingController = MediaHandlingController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload and process a media file' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                maxSize: { type: 'number', example: 10485760 },
                allowedTypes: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['image/jpeg', 'image/png'],
                },
                generateThumbnail: { type: 'boolean', example: true },
                expirationDays: { type: 'number', example: 30 },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Media file uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                fileId: { type: 'string' },
                url: { type: 'string' },
                thumbnailUrl: { type: 'string' },
                metadata: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('maxSize')),
    __param(2, (0, common_1.Query)('allowedTypes')),
    __param(3, (0, common_1.Query)('generateThumbnail')),
    __param(4, (0, common_1.Query)('expirationDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, Boolean, Number]),
    __metadata("design:returntype", Promise)
], MediaHandlingController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Get)(':fileId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a media file by ID' }),
    (0, swagger_1.ApiParam)({
        name: 'fileId',
        required: true,
        type: 'string',
        example: 'media-1234567890-abc123def456',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media file retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaHandlingController.prototype, "getMediaFile", null);
__decorate([
    (0, common_1.Delete)(':fileId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a media file' }),
    (0, swagger_1.ApiParam)({
        name: 'fileId',
        required: true,
        type: 'string',
        example: 'media-1234567890-abc123def456',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media file deleted successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaHandlingController.prototype, "deleteMediaFile", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get all media files' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Media files retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: { type: 'object' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaHandlingController.prototype, "getAllMediaFiles", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clean up expired media files' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Expired media files cleaned up successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'number' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaHandlingController.prototype, "cleanupExpiredFiles", null);
exports.MediaHandlingController = MediaHandlingController = __decorate([
    (0, swagger_1.ApiTags)('Media Handling'),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_handling_service_1.MediaHandlingService])
], MediaHandlingController);
//# sourceMappingURL=media-handling.controller.js.map