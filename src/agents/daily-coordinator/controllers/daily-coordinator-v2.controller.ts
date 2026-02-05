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
import { DailyCoordinatorV2Service } from '../services/daily-coordinator-v2.service';

@ApiTags('Agent - Daily Coordinator V2')
@Controller('api/v2/agent/daily-coordinator')
export class DailyCoordinatorV2Controller {
  constructor(
    private readonly agentService: DailyCoordinatorV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute daily coordination' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Daily coordination executed successfully',
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