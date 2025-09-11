import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentPostSchedulerService } from '../services/agent-post-scheduler.service';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';

@Controller('agents/post-scheduler')
export class AgentPostSchedulerController {
  constructor(private readonly service: AgentPostSchedulerService) {}

  @Post()
  async create(@Body() dto: CreateAgentPostSchedulerDto) {
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