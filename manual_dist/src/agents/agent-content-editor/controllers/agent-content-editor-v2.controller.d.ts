import { AgentContentEditorV2Service } from '../services/agent-content-editor-v2.service';
import { CreateAgentContentEditorDto } from '../dto/create-agent-content-editor.dto';
export declare class AgentContentEditorV2Controller {
    private readonly agentService;
    constructor(agentService: AgentContentEditorV2Service);
    execute(dto: CreateAgentContentEditorDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
    findOne(id: string): Promise<import("../entities/agent-content-editor.entity").AgentContentEditor | null>;
    findAll(): Promise<import("../entities/agent-content-editor.entity").AgentContentEditor[]>;
}
