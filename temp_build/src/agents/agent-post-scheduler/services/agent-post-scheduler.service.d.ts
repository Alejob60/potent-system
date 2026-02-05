import { Repository } from 'typeorm';
import { AgentPostScheduler } from '../entities/agent-post-scheduler.entity';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';
export declare class AgentPostSchedulerService {
    private readonly repo;
    constructor(repo: Repository<AgentPostScheduler>);
    create(dto: CreateAgentPostSchedulerDto): Promise<AgentPostScheduler>;
    findAll(): Promise<AgentPostScheduler[]>;
    findOne(id: string): Promise<AgentPostScheduler | null>;
}
