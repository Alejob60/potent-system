import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AzureCognitiveClient } from '../../lib/azure-cognitive';

@Injectable()
export class ExtractorService {
  private readonly logger = new Logger(ExtractorService.name);

  async processFile(file: Express.Multer.File): Promise<{ text: string; sourceType: 'pdf' | 'image' | 'doc' }> {
    const mimeType = file.mimetype;
    
    if (mimeType === 'application/pdf' || mimeType.includes('officedocument')) {
      this.logger.log(`Processing document: ${file.originalname}`);
      const text = await AzureCognitiveClient.analyzeDocument(file.buffer, mimeType);
      return { text, sourceType: mimeType === 'application/pdf' ? 'pdf' : 'doc' };
    } 
    
    if (mimeType.startsWith('image/')) {
      this.logger.log(`Processing image: ${file.originalname}`);
      const text = await this.processImage(file);
      return { text, sourceType: 'image' };
    }

    throw new BadRequestException(`Unsupported file type: ${mimeType}`);
  }

  private async processImage(file: Express.Multer.File): Promise<string> {
    const openai = AzureCognitiveClient.getOpenAIClient();
    const base64Image = file.buffer.toString('base64');

    try {
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_VISION_DEPLOYMENT || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe detalladamente el contenido visual, textos y diagramas de esta imagen para indexación técnica.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.mimetype};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error processing image with GPT-4o Vision: ${error.message}`);
      throw new Error(`Vision processing failed: ${error.message}`);
    }
  }
}
