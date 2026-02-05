import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentFaqResponder } from '../entities/agent-faq-responder.entity';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';

@Injectable()
export class AgentFaqResponderService {
  constructor(
    @InjectRepository(AgentFaqResponder)
    private readonly repo: Repository<AgentFaqResponder>,
  ) {}

  async create(dto: CreateAgentFaqResponderDto): Promise<AgentFaqResponder> {
    const answer = `Respuesta generada para: ${dto.question}`;
    const entity = this.repo.create({
      ...dto,
      answer,
    });
    return this.repo.save(entity);
  }

  async findAll(): Promise<AgentFaqResponder[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<AgentFaqResponder | null> {
    return this.repo.findOneBy({ id });
  }
}
