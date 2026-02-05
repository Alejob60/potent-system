import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentMarketingAutomationService } from '../services/agent-marketing-automation.service';
import { CreateAgentMarketingAutomationDto } from '../dto/create-agent-marketing-automation.dto';
import { AgentMarketingAutomation } from '../entities/agent-marketing-automation.entity';

@ApiTags('Agent - Marketing Automation')
@Controller('agent/marketing-automation')
export class AgentMarketingAutomationController {
  constructor(
    private readonly agentService: AgentMarketingAutomationService,
  ) {}

  @Post('design')
  @ApiOperation({ summary: 'Design marketing campaign' })
  @ApiResponse({ status: 201, description: 'Marketing campaign designed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async designCampaign(
    @Body() createDto: CreateAgentMarketingAutomationDto,
  ) {
    return this.agentService.execute(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get marketing campaign by ID' })
  @ApiResponse({ status: 200, description: 'Marketing campaign retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Marketing campaign not found.' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get marketing campaigns by session ID' })
  @ApiResponse({ status: 200, description: 'Marketing campaigns retrieved successfully.' })
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return this.agentService.findBySessionId(sessionId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all marketing campaigns' })
  @ApiResponse({ status: 200, description: 'Marketing campaigns retrieved successfully.' })
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