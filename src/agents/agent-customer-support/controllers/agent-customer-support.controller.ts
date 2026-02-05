import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentCustomerSupportService } from '../services/agent-customer-support.service';
import { CreateAgentCustomerSupportDto } from '../dto/create-agent-customer-support.dto';
import { AgentCustomerSupport } from '../entities/agent-customer-support.entity';

@ApiTags('Agent - Customer Support')
@Controller('agent/customer-support')
export class AgentCustomerSupportController {
  constructor(
    private readonly agentService: AgentCustomerSupportService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate customer support response' })
  @ApiResponse({ status: 201, description: 'Customer support response generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async generateSupportResponse(
    @Body() createDto: CreateAgentCustomerSupportDto,
  ) {
    return this.agentService.execute(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer support response by ID' })
  @ApiResponse({ status: 200, description: 'Customer support response retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Customer support response not found.' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get customer support responses by session ID' })
  @ApiResponse({ status: 200, description: 'Customer support responses retrieved successfully.' })
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return this.agentService.findBySessionId(sessionId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customer support responses' })
  @ApiResponse({ status: 200, description: 'Customer support responses retrieved successfully.' })
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