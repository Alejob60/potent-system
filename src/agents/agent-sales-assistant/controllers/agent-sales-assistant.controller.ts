import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentSalesAssistantService } from '../services/agent-sales-assistant.service';
import { CreateAgentSalesAssistantDto } from '../dto/create-agent-sales-assistant.dto';
import { AgentSalesAssistant } from '../entities/agent-sales-assistant.entity';

@ApiTags('Agent - Sales Assistant')
@Controller('agent/sales-assistant')
export class AgentSalesAssistantController {
  constructor(
    private readonly agentService: AgentSalesAssistantService,
  ) {}

  @Post('qualify')
  @ApiOperation({ summary: 'Qualify sales lead' })
  @ApiResponse({ status: 201, description: 'Sales lead qualified successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async qualifyLead(
    @Body() createDto: CreateAgentSalesAssistantDto,
  ) {
    return this.agentService.execute(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales qualification by ID' })
  @ApiResponse({ status: 200, description: 'Sales qualification retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Sales qualification not found.' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get sales qualifications by session ID' })
  @ApiResponse({ status: 200, description: 'Sales qualifications retrieved successfully.' })
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return this.agentService.findBySessionId(sessionId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales qualifications' })
  @ApiResponse({ status: 200, description: 'Sales qualifications retrieved successfully.' })
  async findAll(@Query() query: any) {
    return this.agentService.findAll();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get agent metrics' })
  @ApiResponse({ status: 200, description: 'Agent metrics retrieved successfully.' })
  async getMetrics() {
    return this.agentService.getMetrics();
  }
}