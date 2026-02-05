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
import { CampaignV2Service } from '../services/campaign-v2.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';

@ApiTags('Agent - Campaign V2')
@Controller('api/v2/agent/campaign')
export class CampaignV2Controller {
  constructor(
    private readonly agentService: CampaignV2Service,
  ) {}

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute campaign management' })
  @ApiBody({ type: CreateCampaignDto })
  @ApiResponse({
    status: 200,
    description: 'Campaign management executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async execute(@Body() dto: CreateCampaignDto) {
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
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(@Param('id') id: string) {
    return this.agentService.findOne(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({
    status: 200,
    description: 'All campaigns retrieved successfully',
  })
  async findAll() {
    return this.agentService.findAll();
  }
}