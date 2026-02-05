export interface ServiceBusMessagePayload {
    id: string;
    type: string;
    payload: any;
    correlationId?: string;
    timestamp: Date;
    metadata?: any;
}
export declare class ServiceBusService {
    private readonly logger;
    private readonly client;
    private readonly queueName;
    constructor();
    sendMessage(messagePayload: ServiceBusMessagePayload): Promise<void>;
    receiveMessages(handler: (message: ServiceBusMessagePayload) => Promise<void>, maxMessages?: number): Promise<void>;
    private validateMessageSchema;
    close(): Promise<void>;
}
