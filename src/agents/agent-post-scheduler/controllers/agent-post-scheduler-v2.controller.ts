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
import { AgentPostSchedulerV2Service } from '../services/agent-post-scheduler-v2.service';
import { CreateAgentPostSchedulerDto } from '../dto/create-agent-post-scheduler.dto';

@ApiTags('Agent - Post Scheduler V2')
@Controller('api/v2/agent/post-scheduler')
export class AgentPostSchedulerV2Controller {
  constructor(
    private readonly agentService: AgentPostSchedulerV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute post scheduling' })
  @ApiBody({ type: CreateAgentPostSchedulerDto })
  @ApiResponse({
    status: 200,
    description: 'Post scheduling executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async execute(@Body() dto: CreateAgentPostSchedulerDto) {
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
  @ApiOperation({ summary: 'Get scheduled post by ID' })
  @ApiParam({ name: 'id', description: 'Scheduled post ID' })
  @ApiResponse({
    status: 200,
    description: 'Scheduled post retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Scheduled post not found' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all scheduled posts' })
  @ApiResponse({
    status: 200,
    description: 'All scheduled posts retrieved successfully',
  })
  async findAll() {
    return this.agentService.findAll();
  }
}