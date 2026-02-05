import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ScrumTimelineV2Service } from '../services/scrum-timeline-v2.service';

@ApiTags('Agent - Scrum Timeline V2')
@Controller('api/v2/agent/scrum-timeline')
export class ScrumTimelineV2Controller {
  constructor(
    private readonly agentService: ScrumTimelineV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute scrum timeline synchronization' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Scrum timeline synchronization executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async execute(@Body() payload: any) {
    return this.agentService.execute(payload);
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
}