export declare class AgentEventLog {
    id: string;
    sessionId: string;
    correlationId: string;
    agent: string;
    eventType: 'started' | 'progress' | 'completed' | 'failed';
    payload: any;
    metadata: any;
    timestamp: Date;
}
