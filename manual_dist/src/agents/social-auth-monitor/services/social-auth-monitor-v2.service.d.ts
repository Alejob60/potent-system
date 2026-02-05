import { AgentBase, AgentResult } from '../../../common/agents/agent-base';
import { RedisService } from '../../../common/redis/redis.service';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
export declare class SocialAuthMonitorV2Service extends AgentBase {
    constructor(redisService: RedisService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService);
    execute(payload: any): Promise<AgentResult>;
    validate(payload: any): Promise<boolean>;
    private monitorSocialAuth;
    getMetrics(): Promise<any>;
}
