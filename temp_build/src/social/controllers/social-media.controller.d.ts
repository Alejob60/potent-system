import { SocialMediaIntegrationService } from '../social-media-integration.service';
import type { SocialMediaPost } from '../interfaces/social-media.interface';
export declare class SocialMediaController {
    private readonly socialMediaService;
    constructor(socialMediaService: SocialMediaIntegrationService);
    initiateOAuth(platform: string, body: {
        sessionId: string;
        redirectUri: string;
    }): Promise<{
        authUrl: string;
        state: string;
    }>;
    completeOAuth(platform: string, body: {
        code: string;
        state: string;
        redirectUri: string;
    }): Promise<{
        id: string;
        platform: string;
        username: string;
    }>;
    getConnectedAccounts(sessionId: string): import("../interfaces/social-media.interface").SocialMediaAccount[];
    publishPost(post: SocialMediaPost): Promise<SocialMediaPost>;
    schedulePost(post: SocialMediaPost): Promise<SocialMediaPost>;
    getMentions(sessionId: string, platform: string, accountId: string, hours?: string): Promise<never[]>;
    handleWebhook(platform: string, payload: any): Promise<void>;
}
