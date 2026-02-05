import { Controller, Post, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PurchaseIntentDetectorService, PurchaseIntentResult } from './purchase-intent-detector.service';

export class DetectPurchaseIntentDto {
  message: string;
  context?: any;
}

@Controller('purchase-intent')
@ApiTags('Purchase Intent Detection')
export class PurchaseIntentController {
  private readonly logger = new Logger(PurchaseIntentController.name);

  constructor(private readonly purchaseIntentDetector: PurchaseIntentDetectorService) {}

  @Post('detect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect purchase intent in user message' })
  @ApiBody({ type: DetectPurchaseIntentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase intent detection result',
    schema: {
      type: 'object',
      properties: {
        hasPurchaseIntent: { type: 'boolean' },
        confidence: { type: 'number' },
        intentType: { type: 'string' },
        productReferences: { 
          type: 'array',
          items: { type: 'string' }
        },
        urgencyLevel: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async detectPurchaseIntent(
    @Body() detectPurchaseIntentDto: DetectPurchaseIntentDto
  ): Promise<PurchaseIntentResult> {
    try {
      this.logger.log(`Detecting purchase intent for message: ${detectPurchaseIntentDto.message.substring(0, 50)}...`);
      const result = this.purchaseIntentDetector.detectPurchaseIntent(
        detectPurchaseIntentDto.message,
        detectPurchaseIntentDto.context
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to detect purchase intent: ${error.message}`);
      throw error;
    }
  }
}