import { AgentMarketingAutomationService } from '../services/agent-marketing-automation.service';
import { CreateAgentMarketingAutomationDto } from '../dto/create-agent-marketing-automation.dto';
import { AgentMarketingAutomation } from '../entities/agent-marketing-automation.entity';
export declare class AgentMarketingAutomationController {
    private readonly agentService;
    constructor(agentService: AgentMarketingAutomationService);
    designCampaign(createDto: CreateAgentMarketingAutomationDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    findOne(id: string): Promise<AgentMarketingAutomation | null>;
    findBySessionId(sessionId: string): Promise<AgentMarketingAutomation[]>;
    findAll(query: any): Promise<AgentMarketingAutomation[]>;
    getMetrics(): Promise<any>;
}
