import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentAnalyticsReporterService } from '../services/agent-analytics-reporter.service';
import { CreateAgentAnalyticsReporterDto } from '../dto/create-agent-analytics-reporter.dto';

@Controller('agents/analytics-reporter')
export class AgentAnalyticsReporterController {
  constructor(private readonly service: AgentAnalyticsReporterService) {}

  @Post()
  async create(@Body() dto: CreateAgentAnalyticsReporterDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}