import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentAnalyticsReportingService } from '../services/agent-analytics-reporting.service';
import { CreateAgentAnalyticsReportingDto } from '../dto/create-agent-analytics-reporting.dto';
import { AgentAnalyticsReporting } from '../entities/agent-analytics-reporting.entity';

@ApiTags('Agent - Analytics Reporting')
@Controller('agent/analytics-reporting')
export class AgentAnalyticsReportingController {
  constructor(
    private readonly agentService: AgentAnalyticsReportingService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate analytics report' })
  @ApiResponse({ status: 201, description: 'Analytics report generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async generateReport(
    @Body() createDto: CreateAgentAnalyticsReportingDto,
  ) {
    return this.agentService.execute(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get analytics report by ID' })
  @ApiResponse({ status: 200, description: 'Analytics report retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Analytics report not found.' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get analytics reports by session ID' })
  @ApiResponse({ status: 200, description: 'Analytics reports retrieved successfully.' })
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return this.agentService.findBySessionId(sessionId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all analytics reports' })
  @ApiResponse({ status: 200, description: 'Analytics reports retrieved successfully.' })
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