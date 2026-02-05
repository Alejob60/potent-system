import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ChannelAdapter, ChannelType } from './channel-adapter.interface';
import { WhatsappBusinessService } from './whatsapp-business.service';
import { InstagramDmService } from './instagram-dm.service';
import { FacebookMessengerService } from './facebook-messenger.service';
import { EmailService } from './email.service';

@Injectable()
export class ChannelAdapterFactory implements OnModuleInit {
  private adapters: Map<ChannelType, ChannelAdapter> = new Map();

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.registerAdapter(ChannelType.WHATSAPP, this.moduleRef.get(WhatsappBusinessService, { strict: false }));
    this.registerAdapter(ChannelType.INSTAGRAM, this.moduleRef.get(InstagramDmService, { strict: false }));
    this.registerAdapter(ChannelType.MESSENGER, this.moduleRef.get(FacebookMessengerService, { strict: false }));
    this.registerAdapter(ChannelType.EMAIL, this.moduleRef.get(EmailService, { strict: false }));
  }

  private registerAdapter(type: ChannelType, adapter: ChannelAdapter) {
    this.adapters.set(type, adapter);
  }

  getAdapter(type: ChannelType): ChannelAdapter {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`No adapter found for channel type: ${type}`);
    }
    return adapter;
  }
}
