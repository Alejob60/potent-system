import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentVideoScriptor } from '../entities/agent-video-scriptor.entity';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';

@Injectable()
export class AgentVideoScriptorService {
  constructor(
    @InjectRepository(AgentVideoScriptor)
    private readonly repo: Repository<AgentVideoScriptor>,
  ) {}

  async create(dto: CreateAgentVideoScriptorDto): Promise<AgentVideoScriptor> {
    // Simulación: generación de guion
    const script = `Video script for topic: ${dto.topic}`;
    const entity = this.repo.create({
      ...dto,
      script,
    });
    return this.repo.save(entity);
  }

  async findAll(): Promise<AgentVideoScriptor[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<AgentVideoScriptor | null> {
    return this.repo.findOneBy({ id });
  }
}

