import { Controller, Post, Body } from '@nestjs/common';
import { ViralContentGeneratorService } from '../services/viral-content-generator.service';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GeneratedContent } from '../interfaces/generated-content.interface';

@ApiTags('content')
@Controller('content/generate')
export class ViralContentGeneratorController {
  constructor(private readonly service: ViralContentGeneratorService) {}

  @Post()
  @ApiOperation({
    summary: 'Genera contenido viral multiformato',
    description:
      'Produce contenido viral en todos los formatos: video, imagen, meme, post, tags',
  })
  @ApiBody({
    description: 'Datos para generaci n de contenido viral',
    schema: {
      type: 'object',
      properties: {
        context: {
          type: 'object',
          properties: {
            sessionId: { type: 'string', example: 'user-session-123' },
            trend: {
              type: 'object',
              example: {
                id: 'trend-123',
                name: 'Nueva tendencia viral',
                platform: 'tiktok',
              },
            },
            objective: {
              type: 'string',
              example: 'create_viral_video',
            },
            emotionalGoal: {
              type: 'string',
              example: 'humor',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contenido viral generado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inv lidos' })
  async generateContent(@Body() contentData: any): Promise<{
    status: string;
    message: string;
    content: GeneratedContent;
    asset: any;
    timestamp: string;
  }> {
    return this.service.generateViralContent(contentData);
  }
}
