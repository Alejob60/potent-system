import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreativeSynthesizerService } from '../services/creative-synthesizer.service';
import { CreateContentDto } from '../dto/create-content.dto';
import { PublishContentDto } from '../dto/publish-content.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('creative-synthesizer')
@Controller('agents/creative-synthesizer')
export class CreativeSynthesizerController {
  constructor(
    private readonly creativeSynthesizerService: CreativeSynthesizerService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Process content creation request',
    description:
      'Receive context and generate multimedia content based on intention',
  })
  @ApiBody({
    description: 'Content creation parameters',
    type: CreateContentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Content creation request received and queued',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'processing' },
        creationId: { type: 'string', example: 'creation-123' },
        message: {
          type: 'string',
          example:
            'Content creation request received and queued for processing',
        },
        sessionId: { type: 'string', example: 'user-session-123' },
      },
    },
  })
  async processCreation(@Body() createContentDto: CreateContentDto) {
    try {
      return await this.creativeSynthesizerService.processCreationRequest(
        createContentDto,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to process creation request: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('publish')
  @ApiOperation({
    summary: 'Publish content to external platform',
    description: 'Publish generated content to connected external platform',
  })
  @ApiBody({
    description: 'Content publishing parameters',
    type: PublishContentDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Content publish request received and queued',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'publishing' },
        assetId: { type: 'string', example: 'asset-123' },
        message: {
          type: 'string',
          example: 'Content publish request received and queued for processing',
        },
      },
    },
  })
  async publishContent(@Body() publishContentDto: PublishContentDto) {
    try {
      return await this.creativeSynthesizerService.publishContent(
        publishContentDto,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to publish content: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get creation status and metrics',
    description:
      'Retrieve metrics for content generation (time, success, failures)',
  })
  @ApiResponse({
    status: 200,
    description: 'Creation status and metrics',
    schema: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        statistics: {
          type: 'object',
          properties: {
            totalCreations: { type: 'number' },
            processingCreations: { type: 'number' },
            completedCreations: { type: 'number' },
            failedCreations: { type: 'number' },
            avgGenerationTime: { type: 'number' },
          },
        },
      },
    },
  })
  async getCreationStatus() {
    try {
      return await this.creativeSynthesizerService.getCreationStatus();
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve creation status: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get creations by session',
    description: 'Retrieve all creations associated with a session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of session creations',
  })
  async getCreationsBySession(@Param('sessionId') sessionId: string) {
    try {
      return await this.creativeSynthesizerService.getCreationsBySession(
        sessionId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve creations by session: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all creations',
    description: 'Retrieve all content creations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all creations',
  })
  async getAllCreations() {
    try {
      return await this.creativeSynthesizerService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve all creations: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get creation by ID',
    description: 'Retrieve a specific creation by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Creation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Creation details',
  })
  async getCreationById(@Param('id') id: string) {
    try {
      return await this.creativeSynthesizerService.findOne(id);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve creation by ID: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
