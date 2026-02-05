export declare class ActivateCampaignDto {
    campaignType: string;
    sessionId: string;
    emotion: string;
    platforms: string[];
    durationDays: number;
    objective: string;
    agents: string[];
    schedule: {
        start: string;
        end: string;
    };
    metadata?: any;
}
