import { RateLimitingService, RateLimitConfig } from './rate-limiting.service';
export declare class RateLimitingController {
    private readonly rateLimitingService;
    constructor(rateLimitingService: RateLimitingService);
    setChannelConfig(channel: string, config: RateLimitConfig): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getRateLimitInfo(channel: string, identifier: string): Promise<{
        success: boolean;
        data: import("./rate-limiting.service").RateLimitInfo;
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
    resetRateLimit(channel: string, identifier: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    unbanIdentifier(channel: string, identifier: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    getAllConfigurations(): Promise<{
        success: boolean;
        data: {
            [k: string]: RateLimitConfig;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
