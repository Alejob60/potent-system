import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentAnalyticsReporter } from '../entities/agent-analytics-reporter.entity';
import { CreateAgentAnalyticsReporterDto } from '../dto/create-agent-analytics-reporter.dto';

@Injectable()
export class AgentAnalyticsReporterService {
  constructor(
    @InjectRepository(AgentAnalyticsReporter)
    private readonly repo: Repository<AgentAnalyticsReporter>,
  ) {}

  async create(
    dto: CreateAgentAnalyticsReporterDto,
  ): Promise<AgentAnalyticsReporter> {
    // Simulaci n: reporte anal tico generado con datos estad sticos simulados
    const reportData = {
      metric: dto.metric || 'engagement',
      period: dto.period || 'daily',
      stats: [1, 2, 3, 4],
    };
    const entity = this.repo.create({
      ...dto,
      reportData,
    });
    return this.repo.save(entity);
  }

  async findAll(): Promise<AgentAnalyticsReporter[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<AgentAnalyticsReporter | null> {
    return this.repo.findOneBy({ id });
  }
}
