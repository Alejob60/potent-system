import { AgentFaqResponderV2Service } from '../services/agent-faq-responder-v2.service';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';
export declare class AgentFaqResponderV2Controller {
    private readonly service;
    constructor(service: AgentFaqResponderV2Service);
    create(dto: CreateAgentFaqResponderDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    findAll(): Promise<import("../entities/agent-faq-responder.entity").AgentFaqResponder[]>;
    findOne(id: string): Promise<import("../entities/agent-faq-responder.entity").AgentFaqResponder | null>;
    findBySession(sessionId: string): Promise<import("../entities/agent-faq-responder.entity").AgentFaqResponder[]>;
    getMetrics(): Promise<any>;
}
