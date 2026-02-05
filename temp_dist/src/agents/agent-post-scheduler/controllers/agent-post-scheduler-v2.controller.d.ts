import { AgentPostSchedulerV2Service } from '../services/agent-post-scheduler-v2.service';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';
export declare class AgentPostSchedulerV2Controller {
    private readonly agentService;
    constructor(agentService: AgentPostSchedulerV2Service);
    execute(dto: CreateAgentPostSchedulerDto): Promise<import("../../../common/agents/agent-base").AgentResult>;
    getMetrics(): Promise<any>;
    findOne(id: string): Promise<import("../entities/agent-post-scheduler.entity").AgentPostScheduler | null>;
    findAll(): Promise<import("../entities/agent-post-scheduler.entity").AgentPostScheduler[]>;
}
