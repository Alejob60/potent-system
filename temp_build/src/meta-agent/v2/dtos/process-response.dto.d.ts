export declare class ActionDto {
    type: string;
    params: Record<string, any>;
    status?: 'pending' | 'sent' | 'processing' | 'completed' | 'failed';
    target?: string;
}
export declare class RoutingDecisionDto {
    primaryAgent: string;
    fallbackAgents?: string[];
    confidence: number;
    reasoning?: string;
}
export declare class MetricsDto {
    processingTimeMs: number;
    tokensConsumed: number;
    embeddingsUsed: number;
    cacheStatus: 'hit' | 'miss' | 'partial';
    additional?: Record<string, any>;
}
export declare class ProcessResponseDto {
    correlationId: string;
    sessionId: string;
    responseText: string;
    actions?: ActionDto[];
    routingDecision?: RoutingDecisionDto;
    metrics: MetricsDto;
    timestamp: string;
    metadata?: Record<string, any>;
}
