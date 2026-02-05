import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AgentAnalyticsReporterV2Service } from '../services/agent-analytics-reporter-v2.service';
import { CreateAgentAnalyticsReporterDto } from '../dto/create-agent-analytics-reporter.dto';

@ApiTags('Agent - Analytics Reporter V2')
@Controller('api/v2/agent/analytics-reporter')
export class AgentAnalyticsReporterV2Controller {
  constructor(
    private readonly agentService: AgentAnalyticsReporterV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute analytics report generation' })
  @ApiBody({ type: CreateAgentAnalyticsReporterDto })
  @ApiResponse({
    status: 200,
    description: 'Analytics report generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async execute(@Body() dto: CreateAgentAnalyticsReporterDto) {
    return this.agentService.execute(dto);
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get agent metrics' })
  @ApiResponse({
    status: 200,
    description: 'Agent metrics retrieved successfully',
  })
  async getMetrics() {
    return this.agentService.getMetrics();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get analytics report by ID' })
  @ApiParam({ name: 'id', description: 'Analytics report ID' })
  @ApiResponse({
    status: 200,
    description: 'Analytics report retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Analytics report not found' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all analytics reports' })
  @ApiResponse({
    status: 200,
    description: 'All analytics reports retrieved successfully',
  })
  async findAll() {
    return this.agentService.findAll();
  }
}