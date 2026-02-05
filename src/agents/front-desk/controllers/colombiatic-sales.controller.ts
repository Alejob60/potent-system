import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { FrontDeskV2Service } from '../services/front-desk-v2.service';
import { FrontDeskRequestDto } from '../dto/front-desk-request.dto';

@ApiTags('Agent - Omnichannel Customer Service')
@Controller('v2/agents/omnichannel-customer-service')
export class ColombiaTicSalesController {
  private readonly logger = new Logger(ColombiaTicSalesController.name);

  constructor(
    private readonly agentService: FrontDeskV2Service,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process omnichannel customer service request' })
  @ApiBody({ type: FrontDeskRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Customer service processing executed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Req() req: Request, @Body() dto: FrontDeskRequestDto) {
    this.logger.log('Received omnichannel customer service request', { dto });
    
    try {
      // Enhance the DTO with omnichannel customer service context
      const enhancedDto: any = {
        ...dto,
        context: {
          ...dto.context,
          siteType: 'colombiatic',
          origin: 'colombiatic.com',
          websiteUrl: 'https://colombiatic.com',
          products: dto.context?.products || [
            'Desarrollo de Sitios Web',
            'Tiendas Online',
            'Aplicaciones Móviles',
            'Marketing Digital',
            'Consultoría Tecnológica'
          ],
          services: dto.context?.services || [
            'Diseño Web Responsivo',
            'Optimización SEO',
            'Integración de Pasarelas de Pago',
            'Soporte Técnico 24/7',
            'Mantenimiento de Sitios Web'
          ],
        },
        tenantContext: dto.tenantContext ? {
          ...dto.tenantContext,
          siteType: 'colombiatic',
          origin: 'colombiatic.com',
          websiteUrl: 'https://colombiatic.com',
          products: dto.tenantContext.products || [
            'Desarrollo de Sitios Web',
            'Tiendas Online',
            'Aplicaciones Móviles',
            'Marketing Digital',
            'Consultoría Tecnológica'
          ],
          services: dto.tenantContext.services || [
            'Diseño Web Responsivo',
            'Optimización SEO',
            'Integración de Pasarelas de Pago',
            'Soporte Técnico 24/7',
            'Mantenimiento de Sitios Web'
          ],
        } : {
          tenantId: 'colombiatic-default',
          siteId: 'colombiatic-site',
          origin: 'colombiatic.com',
          permissions: ['read', 'write'],
          siteType: 'colombiatic',
          websiteUrl: 'https://colombiatic.com',
          products: [
            'Desarrollo de Sitios Web',
            'Tiendas Online',
            'Aplicaciones Móviles',
            'Marketing Digital',
            'Consultoría Tecnológica'
          ],
          services: [
            'Diseño Web Responsivo',
            'Optimización SEO',
            'Integración de Pasarelas de Pago',
            'Soporte Técnico 24/7',
            'Mantenimiento de Sitios Web'
          ],
        }
      };
      
      const result = await this.agentService.execute(enhancedDto);
      this.logger.log('Omnichannel customer service executed successfully', { 
        hasResult: !!result, 
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : null
      });
      return result;
    } catch (error) {
      this.logger.error('Error in omnichannel customer service controller', error.stack);
      throw error;
    }
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get customer service agent metrics' })
  @ApiResponse({
    status: 200,
    description: 'Customer service agent metrics retrieved successfully',
  })
  async getMetrics() {
    return this.agentService.reportMetrics();
  }
}