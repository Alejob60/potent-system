import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { ContentEditorService } from '../services/content-editor.service';
import { EditContentDto } from '../dto/edit-content.dto';
import { ContentEditStatus } from '../entities/content-edit-task.entity';
// Swagger imports
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('content-editor')
@Controller('agents/content-editor')
export class ContentEditorController {
  private readonly logger = new Logger(ContentEditorController.name);

  constructor(private readonly contentEditorService: ContentEditorService) {}

  @Post('edit')
  @ApiOperation({
    summary: 'Edit content asset',
    description: 'Edit a content asset according to platform requirements and emotional context',
  })
  @ApiBody({
    description: 'Content editing parameters',
    schema: {
      type: 'object',
      properties: {
        assetId: { type: 'string', example: 'video123' },
        platform: { type: 'string', example: 'tiktok' },
        emotion: { type: 'string', example: 'excited' },
        campaignId: { type: 'string', example: 'cmp-456' },
        editingProfile: {
          type: 'object',
          properties: {
            resolution: { type: 'string', example: '1080x1920' },
            durationLimit: { type: 'string', example: '60' },
            aspectRatio: { type: 'string', example: '9:16' },
            autoSubtitles: { type: 'boolean', example: true },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['#viral', '#descubre', '#kimisoft']
            },
            style: { type: 'string', example: 'vibrant' }
          }
        }
      },
      required: ['assetId', 'platform', 'emotion', 'campaignId', 'editingProfile'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Content edited successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-123' },
        assetId: { type: 'string', example: 'video123' },
        platform: { type: 'string', example: 'tiktok' },
        emotion: { type: 'string', example: 'excited' },
        campaignId: { type: 'string', example: 'cmp-456' },
        editingProfile: { type: 'object' },
        status: { type: 'string', example: 'edited' },
        sasUrl: { type: 'string', example: 'https://storage.azure.com/assets/video123_edited.mp4?sv=...' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        narrative: { type: 'string', example: ' Tu contenido est  listo para volverse viral en tiktok!   ' },
        suggestions: { 
          type: 'array', 
          items: { type: 'string' },
          example: [
            'Considera a adir efectos de transici n din micos',
            'Agrega texto grande y llamativo en los primeros 3 segundos',
            'Usa m sica trending para maximizar el engagement',
            'Incluye un CTA claro al final del video'
          ]
        }
      }
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters provided' })
  async editContent(@Body() editContentDto: EditContentDto) {
    try {
      const result = await this.contentEditorService.editContent(editContentDto);
      
      // A adir narrativa emocional y sugerencias
      const narrative = this.contentEditorService.generateNarrative(
        editContentDto.emotion, 
        editContentDto.platform, 
        result.status
      );
      
      const suggestions = this.contentEditorService.generateSuggestions(
        editContentDto.platform, 
        editContentDto.emotion
      );
      
      return {
        ...result,
        narrative,
        suggestions
      };
    } catch (error) {
      this.logger.error('Content editing failed:', error.message);
      throw error;
    }
  }

  @Get('status/:assetId')
  @ApiOperation({
    summary: 'Get content edit status',
    description: 'Retrieve the editing status of a specific content asset',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID',
    example: 'video123',
  })
  @ApiResponse({
    status: 200,
    description: 'Content edit status',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-123' },
        assetId: { type: 'string', example: 'video123' },
        platform: { type: 'string', example: 'tiktok' },
        emotion: { type: 'string', example: 'excited' },
        campaignId: { type: 'string', example: 'cmp-456' },
        editingProfile: { type: 'object' },
        status: { type: 'string', example: 'edited' },
        sasUrl: { type: 'string', example: 'https://storage.azure.com/assets/video123_edited.mp4?sv=...' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        narrative: { type: 'string', example: ' Tu contenido est  listo para volverse viral en tiktok!   ' },
        suggestions: { 
          type: 'array', 
          items: { type: 'string' },
          example: [
            'Considera a adir efectos de transici n din micos',
            'Agrega texto grande y llamativo en los primeros 3 segundos',
            'Usa m sica trending para maximizar el engagement',
            'Incluye un CTA claro al final del video'
          ]
        }
      }
    },
  })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getContentEditStatus(@Param('assetId') assetId: string) {
    const task = await this.contentEditorService.getContentEditTask(assetId);
    if (!task) {
      throw new Error('Asset not found');
    }
    
    // A adir narrativa emocional y sugerencias
    const narrative = this.contentEditorService.generateNarrative(
      task.emotion, 
      task.platform, 
      task.status
    );
    
    const suggestions = this.contentEditorService.generateSuggestions(
      task.platform, 
      task.emotion
    );
    
    return {
      ...task,
      narrative,
      suggestions
    };
  }

  @Get('session/:sessionId')
  @ApiOperation({
    summary: 'Get content edit tasks by session',
    description: 'Retrieve all content editing tasks for a specific session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'session-789',
  })
  @ApiResponse({
    status: 200,
    description: 'List of content edit tasks',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          assetId: { type: 'string' },
          platform: { type: 'string' },
          emotion: { type: 'string' },
          campaignId: { type: 'string' },
          editingProfile: { type: 'object' },
          status: { type: 'string' },
          sasUrl: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        }
      }
    },
  })
  async getContentEditTasksBySession(@Param('sessionId') sessionId: string) {
    return this.contentEditorService.getContentEditTasksBySession(sessionId);
  }
}