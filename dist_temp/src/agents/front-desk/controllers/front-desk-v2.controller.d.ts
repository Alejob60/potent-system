import { Request } from 'express';
import { FrontDeskV2Service } from '../services/front-desk-v2.service';
import { FrontDeskRequestDto } from '../dto/front-desk-request.dto';
export declare class FrontDeskV2Controller {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: FrontDeskV2Service);
    create(req: Request, dto: FrontDeskRequestDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<import("../../../common/agents/agent-base").AgentMetrics>;
}
