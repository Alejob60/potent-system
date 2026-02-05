import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { PendingPurchaseService } from './pending-purchase.service';

@ApiTags('Pending Purchase')
@Controller('api/pending-purchase')
export class PendingPurchaseController {
  private readonly logger = new Logger(PendingPurchaseController.name);

  constructor(
    private readonly pendingPurchaseService: PendingPurchaseService,
  ) {}

  @Post('save')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save pending purchase context',
    description: 'Save the pending purchase context for unauthenticated users who express purchase intent'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        tenantId: { type: 'string' },
        context: {
          type: 'object',
          properties: {
            selectedServiceId: { type: 'string' },
            intent: { type: 'string' },
            origin: { type: 'string' },
            timestamp: { type: 'number' },
            conversationSummary: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Pending purchase context saved successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  async savePendingPurchase(
    @Body() saveRequest: any
  ): Promise<any> {
    this.logger.log(
      `Received save pending purchase request - Tenant: ${saveRequest.tenantId}, Session: ${saveRequest.sessionId}`
    );

    try {
      const result = await this.pendingPurchaseService.savePendingPurchase(saveRequest);
      return result;
    } catch (error) {
      this.logger.error(
        `Error saving pending purchase for session ${saveRequest.sessionId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  @Get('restore/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore pending purchase context',
    description: 'Restore the pending purchase context after user authentication'
  })
  @ApiResponse({
    status: 200,
    description: 'Pending purchase context restored successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Pending purchase context not found'
  })
  async restorePendingPurchase(
    @Param('sessionId') sessionId: string
  ): Promise<any> {
    this.logger.log(`Restoring pending purchase context for session: ${sessionId}`);

    try {
      const result = await this.pendingPurchaseService.restorePendingPurchase(sessionId);
      return result;
    } catch (error) {
      this.logger.error(
        `Error restoring pending purchase for session ${sessionId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  @Post('clear/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Clear pending purchase context',
    description: 'Clear the pending purchase context after it has been restored'
  })
  @ApiResponse({
    status: 200,
    description: 'Pending purchase context cleared successfully'
  })
  async clearPendingPurchase(
    @Param('sessionId') sessionId: string
  ): Promise<any> {
    this.logger.log(`Clearing pending purchase context for session: ${sessionId}`);

    try {
      const result = await this.pendingPurchaseService.clearPendingPurchase(sessionId);
      return result;
    } catch (error) {
      this.logger.error(
        `Error clearing pending purchase for session ${sessionId}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}