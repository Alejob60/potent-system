import { MediaHandlingService } from './media-handling.service';
export declare class MediaHandlingController {
    private readonly mediaService;
    constructor(mediaService: MediaHandlingService);
    uploadMedia(file: Express.Multer.File, maxSize?: number, allowedTypes?: string, generateThumbnail?: boolean, expirationDays?: number): Promise<{
        success: boolean;
        error: string;
        fileId?: undefined;
        url?: undefined;
        thumbnailUrl?: undefined;
        metadata?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        fileId: string | undefined;
        url: string | undefined;
        thumbnailUrl: string | undefined;
        metadata: import("./media-handling.service").MediaMetadata | undefined;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        fileId?: undefined;
        url?: undefined;
        thumbnailUrl?: undefined;
        metadata?: undefined;
    }>;
    getMediaFile(fileId: string): Promise<{
        success: boolean;
        data: import("./media-handling.service").MediaFile;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    deleteMediaFile(fileId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getAllMediaFiles(): Promise<{
        success: boolean;
        data: import("./media-handling.service").MediaFile[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    cleanupExpiredFiles(): Promise<{
        success: boolean;
        data: number;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
