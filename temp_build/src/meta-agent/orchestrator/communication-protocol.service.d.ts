import { RedisService } from '../../common/redis/redis.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
import { StateManagementService } from '../../state/state-management.service';
export interface Message {
    id: string;
    type: string;
    sender: string;
    recipient: string;
    payload: any;
    timestamp: Date;
    correlationId?: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
    ttl?: number;
}
export interface MessageQueue {
    name: string;
    messages: Message[];
    maxSize: number;
    currentSize: number;
}
export interface CommunicationProtocolConfig {
    defaultTTL: number;
    maxRetries: number;
    ackTimeout: number;
    compressionEnabled: boolean;
}
export declare class CommunicationProtocolService {
    private readonly redisService;
    private readonly websocketGateway;
    private readonly stateManager;
    private readonly logger;
    private readonly MESSAGE_QUEUE_PREFIX;
    private readonly MESSAGE_PREFIX;
    private readonly ACK_PREFIX;
    private readonly config;
    constructor(redisService: RedisService, websocketGateway: WebSocketGatewayService, stateManager: StateManagementService);
    sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<boolean>;
    receiveMessages(recipient: string, limit?: number): Promise<Message[]>;
    acknowledgeMessage(messageId: string, recipient: string): Promise<boolean>;
    isMessageAcknowledged(messageId: string, recipient: string): Promise<boolean>;
    createMessageQueue(name: string, maxSize?: number): Promise<boolean>;
    getMessageQueue(name: string): Promise<MessageQueue | null>;
    sendWithGuaranteedDelivery(message: Omit<Message, 'id' | 'timestamp'>, maxRetries?: number): Promise<boolean>;
    private waitForAcknowledgment;
    private generateMessageId;
    private compressPayload;
    private decompressPayload;
    broadcastMessage(message: Omit<Message, 'id' | 'timestamp' | 'recipient'>, recipients: string[]): Promise<boolean[]>;
    getMessage(messageId: string): Promise<Message | null>;
}
