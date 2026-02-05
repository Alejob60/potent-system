import { AgentSalesAssistantService } from '../services/agent-sales-assistant.service';
import { CreateAgentSalesAssistantDto } from '../dto/create-agent-sales-assistant.dto';
import { AgentSalesAssistant } from '../entities/agent-sales-assistant.entity';
export declare class AgentSalesAssistantController {
    private readonly agentService;
    constructor(agentService: AgentSalesAssistantService);
    qualifyLead(createDto: CreateAgentSalesAssistantDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    findOne(id: string): Promise<AgentSalesAssistant | null>;
    findBySessionId(sessionId: string): Promise<AgentSalesAssistant[]>;
    findAll(query: any): Promise<AgentSalesAssistant[]>;
    getMetrics(): Promise<any>;
}
