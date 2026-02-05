import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { FrontDeskV2Service } from '../services/front-desk-v2.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('front-desk-v2')
@ApiBearerAuth()
@Controller('api/v2/gateway')
export class FrontDeskV2Controller {
  private readonly logger = new Logger(FrontDeskV2Controller.name);

  constructor(private readonly frontDesk: FrontDeskV2Service) {}

  @Post('process')
  @ApiOperation({ summary: 'Industrial Gateway for MisyBot Meta-Agent' })
  async process(@Request() req, @Body() body: any) {
    const tenantContext = req.tenantContext; // Injected by SecurityMiddleware
    
    this.logger.log(`Gateway received request from tenant: ${tenantContext.tenantId}`);

    return this.frontDesk.execute({
      message: body.message,
      tenantContext: {
        ...tenantContext,
        ...body.context
      }
    });
  }
}
