import { Controller, Post, Get, Body, Query, Param, Logger, BadRequestException } from '@nestjs/common';
import { ChannelAdapterFactory } from './channel-adapter.factory';
import { ChannelType } from './channel-adapter.interface';
import { FrontDeskV2Service } from '../../agents/front-desk/services/front-desk-v2.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('omnichannel')
@Controller('api/v1/omnichannel')
export class OmnichannelController {
  private readonly logger = new Logger(OmnichannelController.name);

  constructor(
    private readonly adapterFactory: ChannelAdapterFactory,
    private readonly frontDesk: FrontDeskV2Service
  ) {}

  @Post('webhook/:channel')
  @ApiOperation({ summary: 'Unified webhook for all channels' })
  async handleWebhook(@Param('channel') channel: string, @Body() payload: any) {
    const channelType = channel as ChannelType;
    this.logger.log(`Received webhook for channel: ${channelType}`);

    try {
      const adapter = this.adapterFactory.getAdapter(channelType);
      const incomingMessages = await adapter.handleWebhook(payload);

      for (const msg of incomingMessages) {
        // En un escenario real, aquí mapearíamos el senderId a un tenantId
        // usando una tabla de ruteo de canales.
        const tenantId = msg.tenantId || 'default'; 

        await this.frontDesk.execute({
          message: msg.content,
          tenantContext: {
            tenantId,
            channel: channelType,
            sessionId: `ext_${channelType}_${msg.senderId}`,
            senderId: msg.senderId,
            ...msg.metadata
          }
        });
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }

  @Get('webhook/:channel')
  @ApiOperation({ summary: 'Webhook verification for Meta platforms' })
  async verifyWebhook(
    @Param('channel') channel: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string
  ) {
    const channelType = channel as ChannelType;
    const adapter = this.adapterFactory.getAdapter(channelType);
    
    if (adapter.verifyWebhook) {
      return adapter.verifyWebhook({ mode, token, challenge });
    }
    
    return challenge;
  }
}
