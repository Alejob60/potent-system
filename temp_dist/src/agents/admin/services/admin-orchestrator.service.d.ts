import { HttpService } from '@nestjs/axios';
import { AgentOrchestrationDto } from '../dto/agent-orchestration.dto';
import { AIDecisionEngine } from '../../../ai/ai-decision-engine.service';
import { StateManagementService, SessionContext } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { CampaignAgentService } from '../../campaign/campaign-agent.service';
export interface AgentResult {
    agent: string;
    result?: unknown;
    error?: string;
}
export declare class AdminOrchestratorService {
    private readonly httpService;
    private readonly aiDecisionEngine;
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly campaignAgent?;
    private readonly logger;
    constructor(httpService: HttpService, aiDecisionEngine: AIDecisionEngine, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, campaignAgent?: CampaignAgentService | undefined);
    private agentMap;
    orchestrate(dto: AgentOrchestrationDto): Promise<PromiseSettledResult<AgentResult>[]>;
    intelligentOrchestrate(message: string, context: SessionContext, sessionId: string): Promise<PromiseSettledResult<AgentResult>[]>;
    private executeAgentsWithUpdates;
    orchestrateCampaign(campaignData: any, sessionId: string): Promise<any>;
    orchestrateMediaGeneration(mediaRequest: any, sessionId: string): Promise<any>;
    private extractErrorMessage;
    checkAgentHealth(url: string): Promise<boolean>;
}
