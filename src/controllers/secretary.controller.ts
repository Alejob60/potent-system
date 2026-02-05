import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SecretaryService, UserInput } from '../services/secretary/secretary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    tenantId: string;
  };
}

@Controller('secretary')
export class SecretaryController {
  constructor(private readonly secretaryService: SecretaryService) {}

  @Post('command')
  @UseGuards(JwtAuthGuard)
  async processCommand(
    @Req() req: AuthenticatedRequest,
    @Body() payload: { input: UserInput }
  ) {
    const { id: userId, tenantId } = req.user;
    const { input } = payload;

    // Validar que el input tenga el texto requerido
    if (!input.text) {
      return {
        success: false,
        error: 'Texto de entrada requerido'
      };
    }

    try {
      const secretaryResponse = await this.secretaryService.processUserRequest(
        userId,
        tenantId,
        input
      );

      // Mapear a la estructura esperada por el frontend
      return {
        response: secretaryResponse.content || 'Comando procesado',
        actions: secretaryResponse.action !== 'CHAT' ? [
          {
            type: secretaryResponse.action,
            label: secretaryResponse.tool || 'Ver detalle',
            payload: {
              jobId: secretaryResponse.jobId,
              nodeId: secretaryResponse.nodeId,
              data: secretaryResponse.data
            }
          }
        ] : [],
        context: {
          intent: secretaryResponse.action,
          confidence: 1.0
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}