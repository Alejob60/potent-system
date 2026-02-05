import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpException,
  Headers,
} from '@nestjs/common';
import { ViralCampaignOrchestratorService } from '../services/viral-campaign-orchestrator.service';
import { ActivateCampaignDto } from '../dto/activate-campaign.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('viral-campaign-orchestrator')
@Controller('agents/viral-campaign-orchestrator')
export class ViralCampaignOrchestratorController {
  constructor(
    private readonly viralCampaignOrchestratorService: ViralCampaignOrchestratorService,
  ) {}

  @Post('activate')
  @ApiOperation({
    summary: 'Activate viral campaign',
    description: 'Activate a modular viral campaign with Scrum methodology',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'User JWT token',
  })
  @ApiBody({
    description: 'Campaign activation parameters',
    type: ActivateCampaignDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Viral campaign activated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'campaign_activated' },
        campaignId: { type: 'string', example: 'campaign-123' },
        message: {
          type: 'string',
          example: 'Viral campaign activated successfully',
        },
        sessionId: { type: 'string', example: 'user-session-123' },
      },
    },
  })
  async activateCampaign(
    @Body() activateCampaignDto: ActivateCampaignDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      // Extraer userId del token (en una implementaci n real, esto se har a con un guard)
      const userId = this.extractUserIdFromToken(authHeader);

      return await this.viralCampaignOrchestratorService.activateCampaign(
        activateCampaignDto,
        userId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to activate viral campaign: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/:campaignId')
  @ApiOperation({
    summary: 'Get campaign status',
    description: 'Retrieve the current status of a viral campaign',
  })
  @ApiParam({
    name: 'campaignId',
    description: 'Campaign ID',
    example: 'campaign-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign status information',
    schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string' },
        campaignType: { type: 'string' },
        status: { type: 'string' },
        currentStage: { type: 'number' },
        stages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              order: { type: 'number' },
              name: { type: 'string' },
              agent: { type: 'string' },
              status: { type: 'string' },
              startedAt: { type: 'string', format: 'date-time' },
              completedAt: { type: 'string', format: 'date-time' },
              output: { type: 'object' },
            },
          },
        },
        metrics: { type: 'object' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getCampaignStatus(@Param('campaignId') campaignId: string) {
    try {
      return await this.viralCampaignOrchestratorService.getCampaignStatus(
        campaignId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve campaign status: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get campaigns by session',
    description: 'Retrieve all viral campaigns for a session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of session campaigns',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          campaignType: { type: 'string' },
          sessionId: { type: 'string' },
          userId: { type: 'string' },
          emotion: { type: 'string' },
          platforms: { type: 'array', items: { type: 'string' } },
          agents: { type: 'array', items: { type: 'string' } },
          durationDays: { type: 'number' },
          schedule: { type: 'object' },
          stages: { type: 'array' },
          currentStage: { type: 'number' },
          status: { type: 'string' },
          metrics: { type: 'object' },
          metadata: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getCampaignsBySession(@Param('sessionId') sessionId: string) {
    try {
      return await this.viralCampaignOrchestratorService.getAllCampaignsBySession(
        sessionId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve campaigns by session: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private extractUserIdFromToken(authHeader: string): string {
    // En una implementaci n real, aqu  se decodificar a el token JWT
    // Por ahora, devolvemos un ID de usuario simulado
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Simulaci n: extraer userId del token
    return 'user_1234567890';
  }
}
