import { AdminOrchestratorService } from '../../admin/services/admin-orchestrator.service';
import { ChatRequestDto } from '../dto/chat-request.dto';
import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { AgentDecision } from '../../../ai/ai-decision-engine.service';
import { HttpService } from '@nestjs/axios';
export declare class ChatController {
    private readonly orchestrator;
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly httpService;
    private readonly logger;
    constructor(orchestrator: AdminOrchestratorService, stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, httpService: HttpService);
    handleChat(body: ChatRequestDto): Promise<{
        reply: any;
        sessionId: string;
        context: import("../../../state/state-management.service").SessionContext;
        status: string;
        message: string;
        frontDeskData: any;
        decision?: undefined;
        error?: undefined;
    } | {
        reply: string;
        sessionId: string;
        context: import("../../../state/state-management.service").SessionContext;
        status: string;
        message: string;
        decision: AgentDecision | undefined;
        frontDeskData?: undefined;
        error?: undefined;
    } | {
        reply: string;
        sessionId: string;
        error: boolean;
        context?: undefined;
        status?: undefined;
        message?: undefined;
        frontDeskData?: undefined;
        decision?: undefined;
    }>;
    private requiresFrontDeskAssistance;
    private processWithFrontDesk;
    private getDefaultResponse;
    private formatErrorResponse;
    private formatResponse;
}
