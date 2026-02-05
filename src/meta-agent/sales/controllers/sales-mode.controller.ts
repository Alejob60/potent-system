import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SalesModeService } from '../sales-mode.service';
import { IntentionDetectionService } from '../intention-detection.service';
import { ActivateSalesModeDto } from '../dtos/activate-sales-mode.dto';
import { ProcessMessageDto } from '../dtos/process-message.dto';
import { GeneratePaymentLinkDto } from '../dtos/generate-payment-link.dto';
import { RequestChannelTransferDto } from '../dtos/request-channel-transfer.dto';

@ApiTags('Sales Mode')
@Controller('api/meta-agent/sales')
export class SalesModeController {
  private readonly logger = new Logger(SalesModeController.name);

  constructor(
    private readonly salesModeService: SalesModeService,
    private readonly intentionDetectionService: IntentionDetectionService,
  ) {}

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate sales mode for tenant' })
  @ApiBody({ type: () => ActivateSalesModeDto })
  @ApiResponse({
    status: 200,
    description: 'Sales mode activated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async activateSalesMode(@Body() dto: ActivateSalesModeDto) {
    this.logger.log('Activating sales mode', { tenantId: dto.tenantId });
    
    try {
      const result = await this.salesModeService.activateSalesMode(dto.tenantId);
      
      if (result) {
        return {
          success: true,
          message: 'Sales mode activated successfully',
          tenantId: dto.tenantId
        };
      } else {
        return {
          success: false,
          error: 'Failed to activate sales mode'
        };
      }
    } catch (error) {
      this.logger.error('Failed to activate sales mode', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('process-message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process user message and detect intention' })
  @ApiBody({ type: () => ProcessMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Message processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            intention: { type: 'string', example: 'interest' },
            servicesDetected: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['desarrollo-web']
            },
            contextSummary: { type: 'string', example: 'Current intent: interest...' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async processMessage(@Body() dto: ProcessMessageDto) {
    this.logger.log('Processing message', { 
      tenantId: dto.tenantId, 
      messageLength: dto.message.length 
    });
    
    try {
      const result = await this.intentionDetectionService.processMessage(dto.tenantId, dto.message);
      
      // Generate appropriate response based on detected intention
      const response = await this.intentionDetectionService.generateResponse(dto.tenantId, result.intention);
      
      return {
        success: true,
        data: result,
        response: response
      };
    } catch (error) {
      this.logger.error('Failed to process message', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('payment-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate payment link for service' })
  @ApiBody({ type: () => GeneratePaymentLinkDto })
  @ApiResponse({
    status: 200,
    description: 'Payment link generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generatePaymentLink(@Body() dto: GeneratePaymentLinkDto) {
    this.logger.log('Generating payment link', { 
      tenantId: dto.tenantId, 
      serviceId: dto.serviceId 
    });
    
    try {
      const paymentLink = await this.salesModeService.generatePaymentLink(dto.tenantId, dto.serviceId);
      
      if (paymentLink) {
        return {
          success: true,
          paymentLink: paymentLink,
          message: 'Payment link generated successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to generate payment link'
        };
      }
    } catch (error) {
      this.logger.error('Failed to generate payment link', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('transfer-channel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request channel transfer' })
  @ApiBody({ type: () => RequestChannelTransferDto })
  @ApiResponse({
    status: 200,
    description: 'Channel transfer requested successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async requestChannelTransfer(@Body() dto: RequestChannelTransferDto) {
    this.logger.log('Requesting channel transfer', { 
      tenantId: dto.tenantId, 
      channel: dto.channel 
    });
    
    try {
      const result = await this.salesModeService.requestChannelTransfer(dto.tenantId, dto.channel);
      
      if (result) {
        return {
          success: true,
          message: `Channel transfer to ${dto.channel} requested successfully`,
          channel: dto.channel
        };
      } else {
        return {
          success: false,
          error: 'Failed to request channel transfer'
        };
      }
    } catch (error) {
      this.logger.error('Failed to request channel transfer', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('context/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get sales context for tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales context retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSalesContext(@Param('tenantId') tenantId: string) {
    this.logger.log('Getting sales context', { tenantId });
    
    try {
      const salesContext = await this.salesModeService.getSalesContext(tenantId);
      
      if (salesContext) {
        return {
          success: true,
          data: salesContext
        };
      } else {
        return {
          success: false,
          error: 'Sales context not found'
        };
      }
    } catch (error) {
      this.logger.error('Failed to get sales context', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('catalog/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get service catalog for tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Service catalog retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getServiceCatalog(@Param('tenantId') tenantId: string) {
    this.logger.log('Getting service catalog', { tenantId });
    
    try {
      const serviceCatalog = await this.salesModeService.getServiceCatalog(tenantId);
      
      if (serviceCatalog) {
        return {
          success: true,
          data: serviceCatalog
        };
      } else {
        return {
          success: false,
          error: 'Service catalog not found'
        };
      }
    } catch (error) {
      this.logger.error('Failed to get service catalog', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('strategies/:tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get sales strategies for tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Sales strategies retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSalesStrategies(@Param('tenantId') tenantId: string) {
    this.logger.log('Getting sales strategies', { tenantId });
    
    try {
      const salesStrategies = await this.salesModeService.getSalesStrategies(tenantId);
      
      if (salesStrategies) {
        return {
          success: true,
          data: salesStrategies
        };
      } else {
        return {
          success: false,
          error: 'Sales strategies not found'
        };
      }
    } catch (error) {
      this.logger.error('Failed to get sales strategies', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
}