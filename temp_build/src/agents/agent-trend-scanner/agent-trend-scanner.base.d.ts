import { AgentBase, AgentResult } from '../../common/agents/agent-base';
import { RedisService } from '../../common/redis/redis.service';
import { StateManagementService } from '../../state/state-management.service';
import { WebSocketGatewayService } from '../../websocket/websocket.gateway';
interface TrendAnalysisPayload {
    sessionId?: string;
    platform?: string;
    topic: string;
    dateRange?: string;
    detailLevel?: string;
    region?: string;
}
export declare class AgentTrendScannerBase extends AgentBase {
    constructor(redisService?: RedisService, stateManager?: StateManagementService, websocketGateway?: WebSocketGatewayService);
    execute(payload: TrendAnalysisPayload): Promise<AgentResult>;
    validate(payload: TrendAnalysisPayload): Promise<boolean>;
    private performTrendAnalysis;
}
export {};
