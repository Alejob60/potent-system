import { Repository } from 'typeorm';
import { AgentFaqResponder } from '../entities/agent-faq-responder.entity';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';
export declare class AgentFaqResponderService {
    private readonly repo;
    constructor(repo: Repository<AgentFaqResponder>);
    create(dto: CreateAgentFaqResponderDto): Promise<AgentFaqResponder>;
    findAll(): Promise<AgentFaqResponder[]>;
    findOne(id: string): Promise<AgentFaqResponder | null>;
}
