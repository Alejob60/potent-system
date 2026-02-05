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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_service_1 = require("./email.service");
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendTextEmail(to, subject, text) {
        try {
            const result = await this.emailService.sendTextEmail(to, subject, text);
            return {
                success: true,
                data: result,
                message: 'Email sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send email',
            };
        }
    }
    async sendHtmlEmail(to, subject, html) {
        try {
            const result = await this.emailService.sendHtmlEmail(to, subject, html);
            return {
                success: true,
                data: result,
                message: 'HTML email sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send HTML email',
            };
        }
    }
    async sendTemplatedEmail(to, subject, template, context) {
        try {
            const result = await this.emailService.sendTemplatedEmail(to, subject, template, context);
            return {
                success: true,
                data: result,
                message: 'Templated email sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send templated email',
            };
        }
    }
    async sendBulkEmail(recipients, subject, html) {
        try {
            const result = await this.emailService.sendBulkEmail(recipients, subject, html);
            return {
                success: true,
                data: result,
                message: 'Bulk emails sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to send bulk emails',
            };
        }
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('send-text'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a text email' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: 'user@example.com' },
                subject: { type: 'string', example: 'Hello from MisyBot' },
                text: { type: 'string', example: 'This is a simple text email.' },
            },
            required: ['to', 'subject', 'text'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Email sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('to')),
    __param(1, (0, common_1.Body)('subject')),
    __param(2, (0, common_1.Body)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendTextEmail", null);
__decorate([
    (0, common_1.Post)('send-html'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send an HTML email' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: 'user@example.com' },
                subject: { type: 'string', example: 'Hello from MisyBot' },
                html: { type: 'string', example: '<h1>Hello from MisyBot</h1><p>This is an HTML email.</p>' },
            },
            required: ['to', 'subject', 'html'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'HTML email sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('to')),
    __param(1, (0, common_1.Body)('subject')),
    __param(2, (0, common_1.Body)('html')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendHtmlEmail", null);
__decorate([
    (0, common_1.Post)('send-template'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a templated email' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: 'user@example.com' },
                subject: { type: 'string', example: 'Hello from MisyBot' },
                template: { type: 'string', example: 'welcome' },
                context: {
                    type: 'object',
                    example: {
                        name: 'John Doe',
                        company: 'MisyBot',
                    },
                },
            },
            required: ['to', 'subject', 'template'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Templated email sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('to')),
    __param(1, (0, common_1.Body)('subject')),
    __param(2, (0, common_1.Body)('template')),
    __param(3, (0, common_1.Body)('context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendTemplatedEmail", null);
__decorate([
    (0, common_1.Post)('send-bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send a bulk email to multiple recipients' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                recipients: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['user1@example.com', 'user2@example.com'],
                },
                subject: { type: 'string', example: 'Hello from MisyBot' },
                html: { type: 'string', example: '<h1>Hello from MisyBot</h1><p>This is a bulk email.</p>' },
            },
            required: ['recipients', 'subject', 'html'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Bulk emails sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: { type: 'array', items: { type: 'object' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)('recipients')),
    __param(1, (0, common_1.Body)('subject')),
    __param(2, (0, common_1.Body)('html')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendBulkEmail", null);
exports.EmailController = EmailController = __decorate([
    (0, swagger_1.ApiTags)('Email'),
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map