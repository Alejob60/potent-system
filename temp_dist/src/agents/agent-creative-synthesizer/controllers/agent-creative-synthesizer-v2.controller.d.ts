import { AgentCreativeSynthesizerV2Service } from '../services/agent-creative-synthesizer-v2.service';
import { CreateAgentCreativeSynthesizerDto } from '../dto/create-agent-creative-synthesizer.dto';
export declare class AgentCreativeSynthesizerV2Controller {
    private readonly agentService;
    constructor(agentService: AgentCreativeSynthesizerV2Service);
    execute(dto: CreateAgentCreativeSynthesizerDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
    findOne(id: string): Promise<import("../entities/agent-creative-synthesizer.entity").AgentCreativeSynthesizer | null>;
    findAll(): Promise<import("../entities/agent-creative-synthesizer.entity").AgentCreativeSynthesizer[]>;
}
