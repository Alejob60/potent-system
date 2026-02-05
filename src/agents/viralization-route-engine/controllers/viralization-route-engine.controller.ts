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
import { ViralizationRouteEngineService } from '../services/viralization-route-engine.service';
import { ActivateRouteDto } from '../dto/activate-route.dto';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('viralization-route-engine')
@Controller('agents/viralization-route-engine')
export class ViralizationRouteEngineController {
  constructor(
    private readonly viralizationRouteEngineService: ViralizationRouteEngineService,
  ) {}

  @Post('activate')
  @ApiOperation({
    summary: 'Activate viralization route',
    description: 'Activate a predefined viralization route for a campaign',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'User JWT token',
  })
  @ApiBody({
    description: 'Route activation parameters',
    type: ActivateRouteDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Viralization route activated successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'route_activated' },
        routeId: { type: 'string', example: 'route-123' },
        message: {
          type: 'string',
          example: 'Viralization route activated successfully',
        },
        sessionId: { type: 'string', example: 'user-session-123' },
      },
    },
  })
  async activateRoute(
    @Body() activateRouteDto: ActivateRouteDto,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      // Extraer userId del token (en una implementaci n real, esto se har a con un guard)
      const userId = this.extractUserIdFromToken(authHeader);

      return await this.viralizationRouteEngineService.activateRoute(
        activateRouteDto,
        userId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to activate viralization route: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/:routeId')
  @ApiOperation({
    summary: 'Get route status',
    description: 'Retrieve the current status of a viralization route',
  })
  @ApiParam({
    name: 'routeId',
    description: 'Route ID',
    example: 'route-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Route status information',
  })
  async getRouteStatus(@Param('routeId') routeId: string) {
    try {
      return await this.viralizationRouteEngineService.getRouteStatus(routeId);
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve route status: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get routes by session',
    description: 'Retrieve all viralization routes for a session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'user-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of session routes',
  })
  async getRoutesBySession(@Param('sessionId') sessionId: string) {
    try {
      return await this.viralizationRouteEngineService.getAllRoutesBySession(
        sessionId,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to retrieve routes by session: ${error.message}`,
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
