import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SecretaryService } from '../services/secretary/secretary.service';

interface InteractiveMessage {
  message: string;
  context?: any;
  userId?: string;
  tenantId?: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly secretaryService: SecretaryService) {}

  @Post('interactive')
  @UseGuards(JwtAuthGuard)
  async interactiveChat(@Body() payload: InteractiveMessage) {
    try {
      // Procesar mensaje a través del SecretaryService
      const userInput = {
        text: payload.message,
        context: payload.context || {},
        userId: payload.userId,
        tenantId: payload.tenantId,
        channel: 'web' // Default channel for interactive chat
      };

      const response = await this.secretaryService.processUserRequest(
        payload.userId || 'anonymous',
        payload.tenantId || 'default',
        userInput
      );

      return {
        success: true,
        response: response.content || 'Mensaje procesado',
        actions: response.action !== 'CHAT' ? [{
          type: response.action,
          label: response.tool || 'Acción disponible',
          payload: {
            jobId: response.jobId,
            nodeId: response.nodeId,
            data: response.data
          }
        }] : [],
        context: {
          intent: response.action,
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