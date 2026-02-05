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
var MediaHandlingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaHandlingService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let MediaHandlingService = MediaHandlingService_1 = class MediaHandlingService {
    constructor() {
        this.logger = new common_1.Logger(MediaHandlingService_1.name);
        this.mediaFiles = new Map();
        this.storagePath = './media-storage';
        this.defaultOptions = {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg'],
            generateThumbnail: true,
            expirationDays: 30,
        };
        this.ensureStorageDirectory();
    }
    async uploadMedia(fileBuffer, fileName, mimeType, options) {
        try {
            const opts = { ...this.defaultOptions, ...options };
            const validation = this.validateFile(fileBuffer, mimeType, opts);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error,
                };
            }
            const fileId = this.generateFileId();
            const fileExtension = this.getFileExtension(mimeType);
            const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
            const storedFileName = `${fileId}-${fileNameWithoutExt}.${fileExtension}`;
            const filePath = `${this.storagePath}/${storedFileName}`;
            await this.saveFile(fileBuffer, filePath);
            const checksum = this.generateChecksum(fileBuffer);
            const processedMetadata = await this.processMedia(fileBuffer, mimeType, opts);
            const baseUrl = process.env.MEDIA_BASE_URL || 'http://localhost:3000/media';
            const fileUrl = `${baseUrl}/${storedFileName}`;
            const thumbnailUrl = opts.generateThumbnail ? `${baseUrl}/thumb/${storedFileName}` : undefined;
            const createdAt = new Date();
            const expiresAt = opts.expirationDays
                ? new Date(createdAt.getTime() + opts.expirationDays * 24 * 60 * 60 * 1000)
                : undefined;
            const mediaFile = {
                id: fileId,
                name: fileName,
                type: mimeType,
                size: fileBuffer.length,
                url: fileUrl,
                thumbnailUrl,
                metadata: {
                    ...processedMetadata,
                    checksum,
                },
                createdAt,
                expiresAt,
            };
            this.mediaFiles.set(fileId, mediaFile);
            this.logger.log(`Uploaded media file: ${fileName} (${mimeType})`);
            return {
                success: true,
                fileId,
                url: fileUrl,
                thumbnailUrl,
                metadata: mediaFile.metadata,
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload media: ${error.message}`);
            return {
                success: false,
                error: `Failed to upload media: ${error.message}`,
            };
        }
    }
    getMediaFile(fileId) {
        const file = this.mediaFiles.get(fileId);
        if (file && file.expiresAt && new Date() > file.expiresAt) {
            this.mediaFiles.delete(fileId);
            return null;
        }
        return file || null;
    }
    deleteMediaFile(fileId) {
        try {
            const file = this.mediaFiles.get(fileId);
            if (!file) {
                return false;
            }
            this.mediaFiles.delete(fileId);
            this.logger.log(`Deleted media file: ${fileId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete media file: ${error.message}`);
            return false;
        }
    }
    getAllMediaFiles() {
        const now = new Date();
        const result = [];
        for (const file of this.mediaFiles.values()) {
            if (!file.expiresAt || now <= file.expiresAt) {
                result.push(file);
            }
        }
        return result;
    }
    cleanupExpiredFiles() {
        try {
            const now = new Date();
            let count = 0;
            for (const [fileId, file] of this.mediaFiles.entries()) {
                if (file.expiresAt && now > file.expiresAt) {
                    this.mediaFiles.delete(fileId);
                    count++;
                }
            }
            if (count > 0) {
                this.logger.log(`Cleaned up ${count} expired media files`);
            }
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to clean up expired files: ${error.message}`);
            return 0;
        }
    }
    validateFile(fileBuffer, mimeType, options) {
        if (options.maxSize && fileBuffer.length > options.maxSize) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${options.maxSize} bytes`,
            };
        }
        if (options.allowedTypes && !options.allowedTypes.includes(mimeType)) {
            return {
                valid: false,
                error: `File type ${mimeType} is not allowed`,
            };
        }
        return { valid: true };
    }
    async saveFile(fileBuffer, filePath) {
        this.logger.log(`Would save file to: ${filePath} (${fileBuffer.length} bytes)`);
    }
    async processMedia(fileBuffer, mimeType, options) {
        const metadata = {};
        if (mimeType.startsWith('image/')) {
            metadata.width = 800;
            metadata.height = 600;
            metadata.format = mimeType.split('/')[1];
        }
        else if (mimeType.startsWith('video/')) {
            metadata.duration = 120;
            metadata.format = mimeType.split('/')[1];
        }
        else if (mimeType.startsWith('audio/')) {
            metadata.duration = 180;
            metadata.format = mimeType.split('/')[1];
        }
        return metadata;
    }
    generateChecksum(fileBuffer) {
        return (0, crypto_1.createHash)('sha256').update(fileBuffer).digest('hex');
    }
    generateFileId() {
        return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    getFileExtension(mimeType) {
        const extensions = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'video/mp4': 'mp4',
            'audio/mpeg': 'mp3',
            'application/pdf': 'pdf',
        };
        return extensions[mimeType] || 'bin';
    }
    ensureStorageDirectory() {
        this.logger.log(`Using storage path: ${this.storagePath}`);
    }
};
exports.MediaHandlingService = MediaHandlingService;
exports.MediaHandlingService = MediaHandlingService = MediaHandlingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MediaHandlingService);
//# sourceMappingURL=media-handling.service.js.map