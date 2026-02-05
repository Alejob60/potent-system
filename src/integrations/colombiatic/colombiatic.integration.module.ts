import { Module } from '@nestjs/common';
import { ColombiaTICPaymentIntegrationService } from './colombiatic-payment.integration.service';
import { ColombiaTICChatNotificationService } from './colombiatic-chat.notification.service';
import { ColombiaTICPaymentListenerService } from './colombiatic-payment.listener.service';
import { ColombiaTICPaymentMonitorService } from './colombiatic-payment.monitor.service';
import { ColombiaTICIntegrationController } from './colombiatic.integration.controller';
import { PaymentsModule } from '../../payments/payments.module';
import { SalesModule } from '../../meta-agent/sales/sales.module';
import { CommonModule } from '../../common/common.module';
import { TenantContextModule } from '../../meta-agent/security/tenant-context.module';

@Module({
  imports: [
    PaymentsModule,
    SalesModule,
    CommonModule,
    TenantContextModule,
  ],
  controllers: [ColombiaTICIntegrationController],
  providers: [
    ColombiaTICPaymentIntegrationService,
    ColombiaTICChatNotificationService,
    ColombiaTICPaymentListenerService,
    ColombiaTICPaymentMonitorService,
  ],
  exports: [
    ColombiaTICPaymentIntegrationService,
    ColombiaTICChatNotificationService,
    ColombiaTICPaymentListenerService,
    ColombiaTICPaymentMonitorService,
  ],
})
export class ColombiaTICIntegrationModule {}