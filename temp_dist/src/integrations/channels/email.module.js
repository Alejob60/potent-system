"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const email_service_1 = require("./email.service");
const email_controller_1 = require("./email.controller");
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: process.env.EMAIL_HOST || 'smtp.example.com',
                    port: parseInt(process.env.EMAIL_PORT || '587'),
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER || '',
                        pass: process.env.EMAIL_PASSWORD || '',
                    },
                },
                defaults: {
                    from: process.env.EMAIL_FROM || '"MisyBot" <noreply@example.com>',
                },
            }),
        ],
        controllers: [email_controller_1.EmailController],
        providers: [email_service_1.EmailService],
        exports: [email_service_1.EmailService],
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map