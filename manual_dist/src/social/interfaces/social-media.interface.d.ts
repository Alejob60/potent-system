export interface SocialMediaAccount {
    id: string;
    platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube';
    username: string;
    accountId: string;
    accessToken: string;
    isActive: boolean;
}
export interface SocialMediaPost {
    id?: string;
    platform: string;
    accountId: string;
    content: {
        text?: string;
        imageUrls?: string[];
    };
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    sessionId: string;
}
