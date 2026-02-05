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
import { AgentContentEditorV2Service } from '../services/agent-content-editor-v2.service';
import { CreateAgentContentEditorDto } from '../dto/create-agent-content-editor.dto';

@ApiTags('Agent - Content Editor V2')
@Controller('api/v2/agent/content-editor')
export class AgentContentEditorV2Controller {
  constructor(
    private readonly agentService: AgentContentEditorV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute content editing' })
  @ApiBody({ type: CreateAgentContentEditorDto })
  @ApiResponse({
    status: 200,
    description: 'Content editing executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async execute(@Body() dto: CreateAgentContentEditorDto) {
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
  @ApiOperation({ summary: 'Get content edit by ID' })
  @ApiParam({ name: 'id', description: 'Content edit ID' })
  @ApiResponse({
    status: 200,
    description: 'Content edit retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Content edit not found' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all content edits' })
  @ApiResponse({
    status: 200,
    description: 'All content edits retrieved successfully',
  })
  async findAll() {
    return this.agentService.findAll();
  }
}