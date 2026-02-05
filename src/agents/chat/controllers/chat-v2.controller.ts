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
import { ChatV2Service } from '../services/chat-v2.service';

@ApiTags('Agent - Chat V2')
@Controller('api/v2/agent/chat')
export class ChatV2Controller {
  constructor(
    private readonly agentService: ChatV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute chat response generation' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Chat response generated successfully',
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