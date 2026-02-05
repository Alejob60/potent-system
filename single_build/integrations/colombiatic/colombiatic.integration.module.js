"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColombiaTICIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const colombiatic_payment_integration_service_1 = require("./colombiatic-payment.integration.service");
const colombiatic_chat_notification_service_1 = require("./colombiatic-chat.notification.service");
const colombiatic_payment_listener_service_1 = require("./colombiatic-payment.listener.service");
const colombiatic_payment_monitor_service_1 = require("./colombiatic-payment.monitor.service");
const colombiatic_integration_controller_1 = require("./colombiatic.integration.controller");
const payments_module_1 = require("../../payments/payments.module");
const sales_module_1 = require("../../meta-agent/sales/sales.module");
const common_module_1 = require("../../common/common.module");
const tenant_context_module_1 = require("../../meta-agent/security/tenant-context.module");
let ColombiaTICIntegrationModule = class ColombiaTICIntegrationModule {
};
exports.ColombiaTICIntegrationModule = ColombiaTICIntegrationModule;
exports.ColombiaTICIntegrationModule = ColombiaTICIntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            payments_module_1.PaymentsModule,
            sales_module_1.SalesModule,
            common_module_1.CommonModule,
            tenant_context_module_1.TenantContextModule,
        ],
        controllers: [colombiatic_integration_controller_1.ColombiaTICIntegrationController],
        providers: [
            colombiatic_payment_integration_service_1.ColombiaTICPaymentIntegrationService,
            colombiatic_chat_notification_service_1.ColombiaTICChatNotificationService,
            colombiatic_payment_listener_service_1.ColombiaTICPaymentListenerService,
            colombiatic_payment_monitor_service_1.ColombiaTICPaymentMonitorService,
        ],
        exports: [
            colombiatic_payment_integration_service_1.ColombiaTICPaymentIntegrationService,
            colombiatic_chat_notification_service_1.ColombiaTICChatNotificationService,
            colombiatic_payment_listener_service_1.ColombiaTICPaymentListenerService,
            colombiatic_payment_monitor_service_1.ColombiaTICPaymentMonitorService,
        ],
    })
], ColombiaTICIntegrationModule);
