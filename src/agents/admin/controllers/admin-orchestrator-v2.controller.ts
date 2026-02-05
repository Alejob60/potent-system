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
import { AdminOrchestratorV2Service } from '../services/admin-orchestrator-v2.service';

@ApiTags('Agent - Admin Orchestrator V2')
@Controller('api/v2/agent/admin-orchestrator')
export class AdminOrchestratorV2Controller {
  constructor(
    private readonly agentService: AdminOrchestratorV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute agent orchestration' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Agent orchestration executed successfully',
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