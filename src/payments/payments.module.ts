import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentMonitorService } from './services/payment-monitor.service';
import { WebhookIdempotencyService } from './services/webhook-idempotency.service';
import { WompiSecurityService } from './services/wompi-security.service';
import { WebhookEvent } from '../entities/payments/webhook-event.entity';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '../common/common.module';
import { ChatModule } from '../chat/chat.module';
import { LoggingModule } from '../common/logging/logging.module';
import { TenantContextModule } from '../meta-agent/security/tenant-context.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEvent]),
    HttpModule,
    CommonModule,
    ChatModule,
    LoggingModule,
    TenantContextModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentMonitorService, WebhookIdempotencyService, WompiSecurityService],
  exports: [PaymentService, PaymentMonitorService, WebhookIdempotencyService, WompiSecurityService],
})
export class PaymentsModule {}