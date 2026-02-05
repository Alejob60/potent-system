import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KnowledgeService } from '../services/knowledge/knowledge.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('feedback')
@ApiBearerAuth()
@Controller('api/feedback')
@UseGuards(AuthGuard('jwt'))
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('content')
  @ApiOperation({ summary: 'Update content performance in Vector Store' })
  async updateFeedback(@Request() req, @Body() body: { contentId: string, success: boolean, likes?: number }) {
    const tenantId = req.user.tenantId;
    this.logger.log(`Received feedback for content ${body.contentId}: success=${body.success}`);

    // En un escenario real, aquí buscaríamos el documento en MongoDB y actualizaríamos sus metadatos
    // para que el RAG priorice contenidos con SUCCESS=true
    
    // Simulación de actualización en Vector Store
    await this.knowledgeService.updateMetadata(body.contentId, {
      viralSuccess: body.success,
      likes: body.likes || 0,
      lastUpdated: new Date()
    });

    return { status: 'Success', message: 'Weights updated in Vector Store' };
  }
}
