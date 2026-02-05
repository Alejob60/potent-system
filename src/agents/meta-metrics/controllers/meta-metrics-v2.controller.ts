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
import { MetaMetricsV2Service } from '../services/meta-metrics-v2.service';

@ApiTags('Agent - Meta Metrics V2')
@Controller('api/v2/agent/meta-metrics')
export class MetaMetricsV2Controller {
  constructor(
    private readonly agentService: MetaMetricsV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute meta metrics collection' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Meta metrics collection executed successfully',
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