import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AgentTrendScannerService } from '../services/agent-trend-scanner.service';
import { CreateAgentTrendScannerDto } from '../dto/create-agent-trend-scanner.dto';

@Controller('agents/trend-scanner')
export class AgentTrendScannerController {
  constructor(private readonly service: AgentTrendScannerService) {}

  @Post()
  async create(@Body() dto: CreateAgentTrendScannerDto) {
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