import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export interface ActionMessage {
    type: string;
    params: Record<string, any>;
    target?: string;
    correlationId: string;
    tenantId: string;
    sessionId: string;
    userId?: string;
    metadata?: Record<string, any>;
}
export interface MessageHeaders {
    correlationId: string;
    tenantId: string;
    sessionId: string;
    timestamp: string;
    messageId: string;
    retryCount?: number;
}
export declare class ServiceBusPublisherService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private serviceBusClient;
    private sender;
    private readonly topicName;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publishAction(action: ActionMessage): Promise<string>;
    publishActions(actions: ActionMessage[]): Promise<string[]>;
    private sendWithRetry;
    private sendBatchWithRetry;
    private isRetriableError;
    private sleep;
    private generateMessageId;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        message?: string;
    }>;
}
