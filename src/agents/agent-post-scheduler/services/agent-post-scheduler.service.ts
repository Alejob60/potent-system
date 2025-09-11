import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentPostScheduler } from '../entities/agent-post-scheduler.entity';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';

@Injectable()
export class AgentPostSchedulerService {
  constructor(
    @InjectRepository(AgentPostScheduler)
    private readonly repo: Repository<AgentPostScheduler>,
  ) {}

  async create(dto: CreateAgentPostSchedulerDto): Promise<AgentPostScheduler> {
    const entity = this.repo.create({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      published: false,
    });
    return this.repo.save(entity);
  }

  async findAll(): Promise<AgentPostScheduler[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<AgentPostScheduler | null> {
    return this.repo.findOneBy({ id });
  }
}