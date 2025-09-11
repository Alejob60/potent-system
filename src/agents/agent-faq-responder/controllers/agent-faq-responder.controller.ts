import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentFaqResponderService } from '../services/agent-faq-responder.service';
import { CreateAgentFaqResponderDto } from '../dto/create-agent-faq-responder.dto';

@Controller('agents/faq-responder')
export class AgentFaqResponderController {
  constructor(private readonly service: AgentFaqResponderService) {}

  @Post()
  async create(@Body() dto: CreateAgentFaqResponderDto) {
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