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
import { KnowledgeInjectorV2Service } from '../services/knowledge-injector-v2.service';

@ApiTags('Agent - Knowledge Injector V2')
@Controller('api/v2/agent/knowledge-injector')
export class KnowledgeInjectorV2Controller {
  constructor(
    private readonly agentService: KnowledgeInjectorV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute knowledge injection' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Knowledge injection executed successfully',
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