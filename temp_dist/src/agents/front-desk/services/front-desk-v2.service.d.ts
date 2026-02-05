import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AIDecisionEngine } from '../../../ai/ai-decision-engine.service';
import { FrontDeskConversation } from '../entities/front-desk-conversation.entity';
import { Repository } from 'typeorm';
import { PurchaseIntentDetectorService } from '../../../services/purchase-intent-detector.service';
interface FrontDeskPayload {
    message: string;
    context?: {
        sessionId?: string;
        language?: string;
        origin?: string;
        siteType?: string;
        products?: string[];
        services?: string[];
        websiteUrl?: string;
        [key: string]: any;
    };
    tenantContext?: {
        tenantId: string;
        siteId: string;
        origin: string;
        permissions: string[];
        channel?: string;
        sessionId?: string;
        siteType?: string;
        products?: string[];
        services?: string[];
        websiteUrl?: string;
        [key: string]: any;
    };
}
export declare class FrontDeskV2Service extends AgentBase {
    private readonly aiDecisionEngine;
    private readonly purchaseIntentDetector;
    private readonly conversationRepository;
    constructor(redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, aiDecisionEngine: AIDecisionEngine, purchaseIntentDetector: PurchaseIntentDetectorService, conversationRepository: Repository<FrontDeskConversation>);
    execute(payload: FrontDeskPayload): Promise<AgentResult>;
    validate(payload: FrontDeskPayload): Promise<boolean>;
    private processMessageWithAI;
    private detectEmotionWithAI;
    private detectEmotionRuleBased;
    private generateEmotionalResponse;
    private generateRuleBasedResponse;
}
export {};
