import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentVideoScriptorService } from '../services/agent-video-scriptor.service';
import { CreateAgentVideoScriptorDto } from '../dto/create-agent-video-scriptor.dto';

@Controller('agents/video-scriptor')
export class AgentVideoScriptorController {
  constructor(private readonly service: AgentVideoScriptorService) {}

  @Post()
  async create(@Body() dto: CreateAgentVideoScriptorDto) {
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