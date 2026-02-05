import { 
  Controller, 
  Post, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Request, 
  Logger,
  BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ExtractorService } from '../services/knowledge/extractor.service';
import { KnowledgeService } from '../services/knowledge/knowledge.service';

@ApiTags('knowledge')
@ApiBearerAuth()
@Controller('knowledge')
@UseGuards(AuthGuard('jwt'))
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);

  constructor(
    private readonly extractorService: ExtractorService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file (PDF, Image) to process into Vector Memory' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.userId;
    const tenantId = req.user.tenantId;

    this.logger.log(`File upload request from user ${userId}: ${file.originalname}`);

    try {
      // 1. Extract text (OCR / Vision)
      const { text, sourceType } = await this.extractorService.processFile(file);

      // 2. Process and Save (Summarize, Vectorize, Mongo)
      const knowledge = await this.knowledgeService.createKnowledge({
        userId,
        tenantId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fullText: text,
        sourceType,
      });

      return {
        success: true,
        documentId: knowledge._id,
        summary: knowledge.summary,
        sourceType: knowledge.sourceType,
      };
    } catch (error) {
      this.logger.error(`Failed to process knowledge upload: ${error.message}`);
      throw new BadRequestException(`Processing failed: ${error.message}`);
    }
  }
}
