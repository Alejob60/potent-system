import { SocialAuthMonitorService } from '../services/social-auth-monitor.service';
export declare class SocialAuthMonitorController {
    private readonly service;
    constructor(service: SocialAuthMonitorService);
    getSocialAuthStatus(): Promise<{
        status: string;
        accountStatus: any[];
        publishingStatus: {
            scheduler: boolean;
            generator: boolean;
            platforms: unknown[];
            message: string;
        };
        timestamp: string;
    }>;
    getPlatformStatus(platform: string): Promise<{
        platform: string;
        accountStatus: any[];
        publishingStatus: {
            platform: string;
            canPublish: boolean;
            activeAccounts: number;
            message: string;
        };
        timestamp: string;
    }>;
    refreshTokens(refreshData: any): Promise<{
        status: string;
        message: string;
        accountId: any;
        result: any;
        timestamp: string;
        platform?: undefined;
        results?: undefined;
        publishingStatus?: undefined;
    } | {
        status: string;
        message: string;
        platform: any;
        results: import("../interfaces/auth-monitor.interface").AccountStatusResult[];
        timestamp: string;
        accountId?: undefined;
        result?: undefined;
        publishingStatus?: undefined;
    } | {
        status: string;
        message: string;
        results: import("../interfaces/auth-monitor.interface").AccountStatusResult[];
        publishingStatus: {
            scheduler: boolean;
            generator: boolean;
            platforms: unknown[];
            message: string;
        };
        timestamp: string;
        accountId?: undefined;
        result?: undefined;
        platform?: undefined;
    }>;
}
