import { AgentPostSchedulerService } from '../services/agent-post-scheduler.service';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';
export declare class AgentPostSchedulerController {
    private readonly service;
    constructor(service: AgentPostSchedulerService);
    create(dto: CreateAgentPostSchedulerDto): Promise<import("../entities/agent-post-scheduler.entity").AgentPostScheduler>;
    findAll(): Promise<import("../entities/agent-post-scheduler.entity").AgentPostScheduler[]>;
    findOne(id: string): Promise<import("../entities/agent-post-scheduler.entity").AgentPostScheduler | null>;
}
