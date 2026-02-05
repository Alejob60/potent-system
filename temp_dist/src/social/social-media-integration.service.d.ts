import { HttpService } from '@nestjs/axios';
import { SocialMediaAccount, SocialMediaPost } from './interfaces/social-media.interface';
export declare class SocialMediaIntegrationService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    initiateOAuth(platform: string, sessionId: string, redirectUri: string): Promise<{
        authUrl: string;
        state: string;
    }>;
    completeOAuth(platform: string, code: string, state: string, redirectUri: string): Promise<{
        id: string;
        platform: string;
        username: string;
    }>;
    publishPost(post: SocialMediaPost): Promise<SocialMediaPost>;
    schedulePost(post: SocialMediaPost): Promise<SocialMediaPost>;
    getRecentMentions(sessionId: string, platform: string, accountId: string, hours?: number): Promise<never[]>;
    getConnectedAccounts(sessionId: string): SocialMediaAccount[];
    handleWebhook(platform: string, payload: any): Promise<void>;
}
