import { AgentVideoScriptorV2Service } from '../services/agent-video-scriptor-v2.service';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';
export declare class AgentVideoScriptorV2Controller {
    private readonly service;
    constructor(service: AgentVideoScriptorV2Service);
    create(dto: CreateAgentVideoScriptorDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    findAll(): Promise<import("../entities/agent-video-scriptor.entity").AgentVideoScriptor[]>;
    findOne(id: string): Promise<import("../entities/agent-video-scriptor.entity").AgentVideoScriptor | null>;
    findBySession(sessionId: string): Promise<import("../entities/agent-video-scriptor.entity").AgentVideoScriptor[]>;
    getMetrics(): Promise<any>;
}
