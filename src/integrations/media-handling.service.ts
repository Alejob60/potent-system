import { Injectable, Logger } from '@nestjs/common';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';

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

@Injectable()
export class MediaHandlingService {
  private readonly logger = new Logger(MediaHandlingService.name);
  private readonly mediaFiles: Map<string, MediaFile> = new Map();
  private readonly storagePath: string = './media-storage';
  private readonly defaultOptions: MediaUploadOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg'],
    generateThumbnail: true,
    expirationDays: 30,
  };

  constructor() {
    // Ensure storage directory exists
    this.ensureStorageDirectory();
  }

  /**
   * Upload and process a media file
   * @param fileBuffer File buffer
   * @param fileName Original file name
   * @param mimeType MIME type
   * @param options Upload options
   * @returns Processing result
   */
  async uploadMedia(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    options?: MediaUploadOptions,
  ): Promise<MediaProcessingResult> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      
      // Validate file
      const validation = this.validateFile(fileBuffer, mimeType, opts);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate file ID and paths
      const fileId = this.generateFileId();
      const fileExtension = this.getFileExtension(mimeType);
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
      const storedFileName = `${fileId}-${fileNameWithoutExt}.${fileExtension}`;
      const filePath = `${this.storagePath}/${storedFileName}`;
      
      // Save file
      await this.saveFile(fileBuffer, filePath);
      
      // Generate checksum
      const checksum = this.generateChecksum(fileBuffer);
      
      // Process media (resize, generate thumbnail, etc.)
      const processedMetadata = await this.processMedia(fileBuffer, mimeType, opts);
      
      // Generate URLs
      const baseUrl = process.env.MEDIA_BASE_URL || 'http://localhost:3000/media';
      const fileUrl = `${baseUrl}/${storedFileName}`;
      const thumbnailUrl = opts.generateThumbnail ? `${baseUrl}/thumb/${storedFileName}` : undefined;
      
      // Calculate expiration
      const createdAt = new Date();
      const expiresAt = opts.expirationDays 
        ? new Date(createdAt.getTime() + opts.expirationDays * 24 * 60 * 60 * 1000)
        : undefined;
      
      // Create media file record
      const mediaFile: MediaFile = {
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

      // Store in memory
      this.mediaFiles.set(fileId, mediaFile);

      this.logger.log(`Uploaded media file: ${fileName} (${mimeType})`);
      
      return {
        success: true,
        fileId,
        url: fileUrl,
        thumbnailUrl,
        metadata: mediaFile.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to upload media: ${error.message}`);
      return {
        success: false,
        error: `Failed to upload media: ${error.message}`,
      };
    }
  }

  /**
   * Get a media file by ID
   * @param fileId File ID
   * @returns Media file or null
   */
  getMediaFile(fileId: string): MediaFile | null {
    const file = this.mediaFiles.get(fileId);
    
    if (file && file.expiresAt && new Date() > file.expiresAt) {
      // File has expired, remove it
      this.mediaFiles.delete(fileId);
      return null;
    }
    
    return file || null;
  }

  /**
   * Delete a media file
   * @param fileId File ID
   * @returns Boolean indicating success
   */
  deleteMediaFile(fileId: string): boolean {
    try {
      const file = this.mediaFiles.get(fileId);
      
      if (!file) {
        return false;
      }

      // In a real implementation, we would also delete the actual file from storage
      this.mediaFiles.delete(fileId);
      
      this.logger.log(`Deleted media file: ${fileId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete media file: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all media files
   * @returns Array of media files
   */
  getAllMediaFiles(): MediaFile[] {
    const now = new Date();
    const result: MediaFile[] = [];
    
    for (const file of this.mediaFiles.values()) {
      // Skip expired files
      if (!file.expiresAt || now <= file.expiresAt) {
        result.push(file);
      }
    }
    
    return result;
  }

  /**
   * Clean up expired media files
   * @returns Number of files cleaned up
   */
  cleanupExpiredFiles(): number {
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
    } catch (error) {
      this.logger.error(`Failed to clean up expired files: ${error.message}`);
      return 0;
    }
  }

  /**
   * Validate a file against upload options
   * @param fileBuffer File buffer
   * @param mimeType MIME type
   * @param options Upload options
   * @returns Validation result
   */
  private validateFile(
    fileBuffer: Buffer,
    mimeType: string,
    options: MediaUploadOptions,
  ): { valid: boolean; error?: string } {
    // Check file size
    if (options.maxSize && fileBuffer.length > options.maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${options.maxSize} bytes`,
      };
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `File type ${mimeType} is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Save a file to storage
   * @param fileBuffer File buffer
   * @param filePath File path
   */
  private async saveFile(fileBuffer: Buffer, filePath: string): Promise<void> {
    // In a real implementation, we would save to actual storage (local, cloud, etc.)
    // For now, we'll just log that we would save the file
    this.logger.log(`Would save file to: ${filePath} (${fileBuffer.length} bytes)`);
  }

  /**
   * Process media file (resize, generate thumbnail, etc.)
   * @param fileBuffer File buffer
   * @param mimeType MIME type
   * @param options Processing options
   * @returns Processed metadata
   */
  private async processMedia(
    fileBuffer: Buffer,
    mimeType: string,
    options: MediaUploadOptions,
  ): Promise<Partial<MediaMetadata>> {
    // In a real implementation, we would use libraries like sharp for image processing
    // For now, we'll just return basic metadata
    const metadata: Partial<MediaMetadata> = {};
    
    // Determine basic metadata based on file type
    if (mimeType.startsWith('image/')) {
      metadata.width = 800; // Placeholder
      metadata.height = 600; // Placeholder
      metadata.format = mimeType.split('/')[1];
    } else if (mimeType.startsWith('video/')) {
      metadata.duration = 120; // Placeholder
      metadata.format = mimeType.split('/')[1];
    } else if (mimeType.startsWith('audio/')) {
      metadata.duration = 180; // Placeholder
      metadata.format = mimeType.split('/')[1];
    }
    
    return metadata;
  }

  /**
   * Generate a checksum for a file buffer
   * @param fileBuffer File buffer
   * @returns Checksum
   */
  private generateChecksum(fileBuffer: Buffer): string {
    return createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Generate a unique file ID
   * @returns Unique file ID
   */
  private generateFileId(): string {
    return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get file extension from MIME type
   * @param mimeType MIME type
   * @returns File extension
   */
  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'application/pdf': 'pdf',
    };
    
    return extensions[mimeType] || 'bin';
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDirectory(): void {
    // In a real implementation, we would check and create the storage directory
    this.logger.log(`Using storage path: ${this.storagePath}`);
  }
}