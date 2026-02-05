import { AgentCustomerSupportService } from '../services/agent-customer-support.service';
import { CreateAgentCustomerSupportDto } from '../dto/create-agent-customer-support.dto';
import { AgentCustomerSupport } from '../entities/agent-customer-support.entity';
export declare class AgentCustomerSupportController {
    private readonly agentService;
    constructor(agentService: AgentCustomerSupportService);
    generateSupportResponse(createDto: CreateAgentCustomerSupportDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    findOne(id: string): Promise<AgentCustomerSupport | null>;
    findBySessionId(sessionId: string): Promise<AgentCustomerSupport[]>;
    findAll(query: any): Promise<AgentCustomerSupport[]>;
    getMetrics(): Promise<any>;
}
