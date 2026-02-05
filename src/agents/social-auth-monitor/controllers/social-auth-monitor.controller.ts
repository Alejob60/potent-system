import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SocialAuthMonitorService } from '../services/social-auth-monitor.service';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('oauth')
@Controller('oauth')
export class SocialAuthMonitorController {
  constructor(private readonly service: SocialAuthMonitorService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Obtiene el estado de conexi n con redes sociales',
    description:
      'Verifica el estado de conexi n con todas las redes sociales configuradas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de conexiones recuperado exitosamente',
  })
  async getSocialAuthStatus() {
    return this.service.getSocialAuthStatus();
  }

  @Get('status/:platform')
  @ApiOperation({
    summary: 'Obtiene el estado de conexi n con una red social espec fica',
    description: 'Verifica el estado de conexi n con una red social espec fica',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de conexi n recuperado exitosamente',
  })
  async getPlatformStatus(@Param('platform') platform: string) {
    return this.service.getPlatformStatus(platform);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renueva tokens de acceso',
    description:
      'Renueva autom ticamente los tokens de acceso para todas las plataformas',
  })
  @ApiBody({
    description: 'Datos para renovaci n de tokens',
    schema: {
      type: 'object',
      properties: {
        platform: { type: 'string', example: 'instagram' },
        accountId: { type: 'string', example: 'account-123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Tokens renovados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inv lidos' })
  async refreshTokens(@Body() refreshData: any) {
    return this.service.refreshTokens(refreshData);
  }
}
