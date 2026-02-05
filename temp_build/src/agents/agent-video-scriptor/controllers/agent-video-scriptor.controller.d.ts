import { AgentVideoScriptorService } from '../services/agent-video-scriptor.service';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
export declare class AgentVideoScriptorController {
    private readonly service;
    constructor(service: AgentVideoScriptorService);
    create(dto: CreateAgentVideoScriptorDto): Promise<import("../entities/agent-video-scriptor.entity").AgentVideoScriptor>;
    findBySessionId(sessionId: string): Promise<import("../entities/agent-video-scriptor.entity").AgentVideoScriptor[]>;
    getMetrics(): Promise<any>;
    findAll(): Promise<import("../entities/agent-video-scriptor.entity").AgentVideoScriptor[]>;
    findOne(id: string): Promise<import("../entities/agent-video-scriptor.entity").AgentVideoScriptor | null>;
}
