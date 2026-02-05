import { Repository } from 'typeorm';
import { AgentVideoScriptor } from '../entities/agent-video-scriptor.entity';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
export declare class AgentVideoScriptorService {
    private readonly repo;
    constructor(repo: Repository<AgentVideoScriptor>);
    create(dto: CreateAgentVideoScriptorDto): Promise<AgentVideoScriptor>;
    findAll(): Promise<AgentVideoScriptor[]>;
    findOne(id: string): Promise<AgentVideoScriptor | null>;
    findBySessionId(sessionId: string): Promise<AgentVideoScriptor[]>;
    getMetrics(): Promise<any>;
    private generateScript;
    private suggestVisuals;
    private generateNarrative;
    private compressScript;
}
