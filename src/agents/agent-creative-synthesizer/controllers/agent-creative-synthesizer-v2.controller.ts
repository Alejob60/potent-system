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
import { AgentCreativeSynthesizerV2Service } from '../services/agent-creative-synthesizer-v2.service';
import { CreateAgentCreativeSynthesizerDto } from '../dto/create-agent-creative-synthesizer.dto';

@ApiTags('Agent - Creative Synthesizer V2')
@Controller('api/v2/agent/creative-synthesizer')
export class AgentCreativeSynthesizerV2Controller {
  constructor(
    private readonly agentService: AgentCreativeSynthesizerV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute creative synthesis' })
  @ApiBody({ type: CreateAgentCreativeSynthesizerDto })
  @ApiResponse({
    status: 200,
    description: 'Creative synthesis executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async execute(@Body() dto: CreateAgentCreativeSynthesizerDto) {
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
  @ApiOperation({ summary: 'Get creative creation by ID' })
  @ApiParam({ name: 'id', description: 'Creative creation ID' })
  @ApiResponse({
    status: 200,
    description: 'Creative creation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Creative creation not found' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all creative creations' })
  @ApiResponse({
    status: 200,
    description: 'All creative creations retrieved successfully',
  })
  async findAll() {
    return this.agentService.findAll();
  }
}