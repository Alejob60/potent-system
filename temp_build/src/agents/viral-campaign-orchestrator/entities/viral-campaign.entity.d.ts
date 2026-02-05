export declare class ViralCampaign {
    id: string;
    campaignType: string;
    sessionId: string;
    userId: string;
    emotion: string;
    platforms: string[];
    agents: string[];
    durationDays: number;
    schedule: {
        start: Date;
        end: Date;
    };
    stages: {
        order: number;
        name: string;
        agent: string;
        status: string;
        startedAt?: Date;
        completedAt?: Date;
        output?: any;
    }[];
    currentStage: number;
    status: string;
    metrics: {
        engagement?: number;
        reach?: number;
        conversion?: number;
    };
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
