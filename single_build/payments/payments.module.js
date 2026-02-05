"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_controller_1 = require("./controllers/payment.controller");
const payment_service_1 = require("./services/payment.service");
const payment_monitor_service_1 = require("./services/payment-monitor.service");
const webhook_idempotency_service_1 = require("./services/webhook-idempotency.service");
const wompi_security_service_1 = require("./services/wompi-security.service");
const webhook_event_entity_1 = require("../entities/payments/webhook-event.entity");
const axios_1 = require("@nestjs/axios");
const common_module_1 = require("../common/common.module");
const chat_module_1 = require("../chat/chat.module");
const logging_module_1 = require("../common/logging/logging.module");
const tenant_context_module_1 = require("../meta-agent/security/tenant-context.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([webhook_event_entity_1.WebhookEvent]),
            axios_1.HttpModule,
            common_module_1.CommonModule,
            chat_module_1.ChatModule,
            logging_module_1.LoggingModule,
            tenant_context_module_1.TenantContextModule,
        ],
        controllers: [payment_controller_1.PaymentController],
        providers: [payment_service_1.PaymentService, payment_monitor_service_1.PaymentMonitorService, webhook_idempotency_service_1.WebhookIdempotencyService, wompi_security_service_1.WompiSecurityService],
        exports: [payment_service_1.PaymentService, payment_monitor_service_1.PaymentMonitorService, webhook_idempotency_service_1.WebhookIdempotencyService, wompi_security_service_1.WompiSecurityService],
    })
], PaymentsModule);
