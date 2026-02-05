import { EventBusService } from '../event-bus/event-bus.service';
export interface TrendAnalysis {
    tenantId: string;
    sessionId: string;
    userId?: string;
    engagementRate: number;
    audienceSize: number;
    trendingTopics: string[];
    trendingHashtags: string[];
    contentTypes: ('video' | 'image' | 'text')[];
    platforms: string[];
    competitionLevel: 'low' | 'medium' | 'high';
    peakTimes: string[];
    sentimentScore: number;
    createdAt: Date;
}
export interface ExecutionPlan {
    id: string;
    tenantId: string;
    sessionId: string;
    userId?: string;
    createdAt: Date;
    estimatedCompletion: Date;
    actions: TrendAction[];
    priority: number;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    metadata: Record<string, any>;
}
export interface TrendAction {
    id: string;
    type: 'CREATE_VIDEO' | 'SCHEDULE_POST' | 'ANALYZE_AUDIENCE' | 'GENERATE_CONTENT' | 'OPTIMIZE_TIMING';
    priority: number;
    estimatedDuration: number;
    requiredAgents: string[];
    dependencies: string[];
    parameters: Record<string, any>;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    assignedTo?: string;
    startedAt?: Date;
    completedAt?: Date;
    result?: any;
}
export interface PlanGenerationResult {
    plan: ExecutionPlan;
    confidenceScore: number;
    resourceRequirements: {
        estimatedCost: number;
        requiredAgents: string[];
        executionTime: number;
    };
    risks: string[];
}
export declare class TaskPlannerService {
    private readonly eventBus;
    private readonly logger;
    private readonly ACTION_DURATION_MAP;
    constructor(eventBus: EventBusService);
    generatePlan(trendAnalysis: TrendAnalysis): Promise<PlanGenerationResult>;
    private analyzeTrendAndGenerateActions;
    private optimizeActionSequence;
    private calculateResourceRequirements;
    private calculateCompletionTime;
    private calculatePriority;
    private calculateConfidenceScore;
    private identifyConfidenceFactors;
    private identifyRisks;
    private calculateEstimatedCost;
    private determineTargetEmotion;
    private createAction;
    private getRequiredAgents;
}
