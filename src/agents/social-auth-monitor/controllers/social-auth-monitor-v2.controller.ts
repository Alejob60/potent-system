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
import { SocialAuthMonitorV2Service } from '../services/social-auth-monitor-v2.service';

@ApiTags('Agent - Social Auth Monitor V2')
@Controller('api/v2/agent/social-auth-monitor')
export class SocialAuthMonitorV2Controller {
  constructor(
    private readonly agentService: SocialAuthMonitorV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute social auth monitoring' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Social auth monitoring executed successfully',
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