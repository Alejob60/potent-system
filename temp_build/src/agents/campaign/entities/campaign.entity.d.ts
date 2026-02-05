export declare class Campaign {
    id: string;
    name: string;
    objective: string;
    targetChannels?: string[];
    duration?: number;
    contentTypes?: string[];
    tone?: string;
    budget?: number;
    startDate?: Date;
    sessionId?: string;
    userId?: string;
    status: string;
    metrics?: any;
    progress?: number;
    createdAt: Date;
    updatedAt: Date;
}
