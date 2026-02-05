import { Request } from 'express';
import { ProcessRequestDto } from '../dtos/process-request.dto';
import { ProcessResponseDto } from '../dtos/process-response.dto';
import { MetaAgentProcessService } from '../services/meta-agent-process.service';
import { SessionContextService } from '../services/session-context.service';
import { JwtPayload } from '../guards/jwt-auth.guard';
declare module 'express' {
    interface Request {
        user?: JwtPayload;
        tenantContext?: any;
    }
}
export declare class MetaAgentV2Controller {
    private readonly metaAgentService;
    private readonly sessionContextService;
    private readonly logger;
    constructor(metaAgentService: MetaAgentProcessService, sessionContextService: SessionContextService);
    process(processRequest: ProcessRequestDto, request: Request): Promise<ProcessResponseDto>;
    getSession(sessionId: string, request: Request): Promise<any>;
    submitFeedback(feedbackData: any, request: Request): Promise<any>;
    healthCheck(): Promise<any>;
    getMetrics(request: Request): Promise<any>;
}
