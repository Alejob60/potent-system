export declare class ViralizationRoute {
    id: string;
    routeType: string;
    sessionId: string;
    userId: string;
    emotion: string;
    platforms: string[];
    agents: string[];
    schedule: {
        start: Date;
        end: Date;
    };
    stages: {
        order: number;
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
