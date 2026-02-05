/// <reference types="node" />
/// <reference types="node" />
export interface MediaFile {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    metadata: MediaMetadata;
    createdAt: Date;
    expiresAt?: Date;
}
export interface MediaMetadata {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    checksum: string;
    tags?: string[];
}
export interface MediaUploadOptions {
    maxSize?: number;
    allowedTypes?: string[];
    generateThumbnail?: boolean;
    expirationDays?: number;
}
export interface MediaProcessingResult {
    success: boolean;
    fileId?: string;
    url?: string;
    thumbnailUrl?: string;
    error?: string;
    metadata?: MediaMetadata;
}
export declare class MediaHandlingService {
    private readonly logger;
    private readonly mediaFiles;
    private readonly storagePath;
    private readonly defaultOptions;
    constructor();
    uploadMedia(fileBuffer: Buffer, fileName: string, mimeType: string, options?: MediaUploadOptions): Promise<MediaProcessingResult>;
    getMediaFile(fileId: string): MediaFile | null;
    deleteMediaFile(fileId: string): boolean;
    getAllMediaFiles(): MediaFile[];
    cleanupExpiredFiles(): number;
    private validateFile;
    private saveFile;
    private processMedia;
    private generateChecksum;
    private generateFileId;
    private getFileExtension;
    private ensureStorageDirectory;
}
