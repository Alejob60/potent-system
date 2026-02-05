export declare class CreateCampaignDto {
    name: string;
    objective: string;
    targetChannels?: string[];
    duration?: number;
    contentTypes?: string[];
    tone?: string;
    budget?: number;
    startDate?: string;
    sessionId: string;
    userId?: string;
}
