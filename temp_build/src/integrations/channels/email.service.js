"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(mailerService) {
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(EmailService_1.name);
    }
    async sendTextEmail(to, subject, text) {
        try {
            const result = await this.mailerService.sendMail({
                to,
                subject,
                text,
            });
            this.logger.log(`Successfully sent email to ${to}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
    async sendHtmlEmail(to, subject, html) {
        try {
            const result = await this.mailerService.sendMail({
                to,
                subject,
                html,
            });
            this.logger.log(`Successfully sent HTML email to ${to}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send HTML email to ${to}: ${error.message}`);
            throw new Error(`Failed to send HTML email: ${error.message}`);
        }
    }
    async sendEmailWithAttachments(to, subject, html, attachments) {
        try {
            const result = await this.mailerService.sendMail({
                to,
                subject,
                html,
                attachments,
            });
            this.logger.log(`Successfully sent email with attachments to ${to}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send email with attachments to ${to}: ${error.message}`);
            throw new Error(`Failed to send email with attachments: ${error.message}`);
        }
    }
    async sendTemplatedEmail(to, subject, template, context) {
        try {
            const result = await this.mailerService.sendMail({
                to,
                subject,
                template,
                context,
            });
            this.logger.log(`Successfully sent templated email to ${to}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send templated email to ${to}: ${error.message}`);
            throw new Error(`Failed to send templated email: ${error.message}`);
        }
    }
    async sendBulkEmail(recipients, subject, html) {
        try {
            const results = [];
            for (const recipient of recipients) {
                try {
                    const result = await this.mailerService.sendMail({
                        to: recipient,
                        subject,
                        html,
                    });
                    results.push({ recipient, success: true, result });
                    this.logger.log(`Successfully sent bulk email to ${recipient}`);
                }
                catch (error) {
                    results.push({ recipient, success: false, error: error.message });
                    this.logger.error(`Failed to send bulk email to ${recipient}: ${error.message}`);
                }
            }
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to send bulk emails: ${error.message}`);
            throw new Error(`Failed to send bulk emails: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], EmailService);
//# sourceMappingURL=email.service.js.map