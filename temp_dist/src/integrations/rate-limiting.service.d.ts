export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    banThreshold?: number;
    banDuration?: number;
}
export interface RateLimitInfo {
    count: number;
    resetTime: number;
    violations: number;
    bannedUntil?: number;
}
export declare class RateLimitingService {
    private readonly logger;
    private readonly rateLimitStore;
    private readonly channelConfigs;
    constructor();
    setChannelConfig(channel: string, config: RateLimitConfig): void;
    isRequestAllowed(channel: string, identifier: string): boolean;
    getRateLimitInfo(channel: string, identifier: string): RateLimitInfo | null;
    resetRateLimit(channel: string, identifier: string): void;
    unbanIdentifier(channel: string, identifier: string): void;
    getAllConfigurations(): Map<string, RateLimitConfig>;
    private setDefaultConfigurations;
    private getDefaultConfig;
}
