import { AgentFaqResponderService } from '../services/agent-faq-responder.service';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';
export declare class AgentFaqResponderController {
    private readonly service;
    constructor(service: AgentFaqResponderService);
    create(dto: CreateAgentFaqResponderDto): Promise<import("../entities/agent-faq-responder.entity").AgentFaqResponder>;
    findAll(): Promise<import("../entities/agent-faq-responder.entity").AgentFaqResponder[]>;
    findOne(id: string): Promise<import("../entities/agent-faq-responder.entity").AgentFaqResponder | null>;
}
