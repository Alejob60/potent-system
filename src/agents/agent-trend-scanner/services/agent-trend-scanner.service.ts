import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentTrendScanner } from '../entities/agent-trend-scanner.entity';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';

@Injectable()
export class AgentTrendScannerService {
  constructor(
    @InjectRepository(AgentTrendScanner)
    private readonly agentTrendScannerRepository: Repository<AgentTrendScanner>,
  ) {}

  async create(dto: CreateAgentTrendScannerDto): Promise<AgentTrendScanner> {
    const trends = [{ name: 'Trend1' }, { name: 'Trend2' }];
    const agent = this.agentTrendScannerRepository.create({
      ...dto,
      trends,
    });
    return await this.agentTrendScannerRepository.save(agent);
  }

  async findAll(): Promise<AgentTrendScanner[]> {
    return this.agentTrendScannerRepository.find();
  }

  async findOne(id: string): Promise<AgentTrendScanner | null> {
    return this.agentTrendScannerRepository.findOneBy({ id });
  }
}