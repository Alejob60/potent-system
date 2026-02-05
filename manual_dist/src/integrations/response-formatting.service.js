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
var ResponseFormattingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormattingService = void 0;
const common_1 = require("@nestjs/common");
let ResponseFormattingService = ResponseFormattingService_1 = class ResponseFormattingService {
    constructor() {
        this.logger = new common_1.Logger(ResponseFormattingService_1.name);
        this.templates = new Map();
        this.formatRules = new Map();
        this.initializeDefaultTemplates();
    }
    addTemplate(template) {
        this.templates.set(template.id, template);
        this.logger.log(`Added formatting template: ${template.name}`);
    }
    getTemplate(templateId) {
        return this.templates.get(templateId) || null;
    }
    removeTemplate(templateId) {
        const result = this.templates.delete(templateId);
        if (result) {
            this.logger.log(`Removed formatting template: ${templateId}`);
        }
        return result;
    }
    addFormatRule(rule) {
        this.formatRules.set(rule.id, rule);
        this.logger.log(`Added response format rule: ${rule.name}`);
    }
    getFormatRule(ruleId) {
        return this.formatRules.get(ruleId) || null;
    }
    removeFormatRule(ruleId) {
        const result = this.formatRules.delete(ruleId);
        if (result) {
            this.logger.log(`Removed response format rule: ${ruleId}`);
        }
        return result;
    }
    formatResponse(channel, content, context) {
        try {
            const matchingRule = this.findMatchingRule(channel, content, context);
            if (matchingRule) {
                return this.applyFormatter(matchingRule.formatter, channel, content, context);
            }
            return this.getDefaultFormatting(channel, content, context);
        }
        catch (error) {
            this.logger.error(`Error formatting response: ${error.message}`);
            return this.getDefaultFormatting(channel, content, context);
        }
    }
    formatWithTemplate(templateId, variables) {
        try {
            const template = this.templates.get(templateId);
            if (!template) {
                throw new Error(`Template ${templateId} not found`);
            }
            let formattedContent = template.template;
            for (const [key, value] of Object.entries(variables)) {
                formattedContent = formattedContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            }
            return formattedContent;
        }
        catch (error) {
            this.logger.error(`Error formatting with template: ${error.message}`);
            throw new Error(`Failed to format with template: ${error.message}`);
        }
    }
    getTemplatesForChannel(channel) {
        const result = [];
        for (const template of this.templates.values()) {
            if (template.channel === channel) {
                result.push(template);
            }
        }
        return result;
    }
    findMatchingRule(channel, content, context) {
        const activeRules = Array.from(this.formatRules.values())
            .filter(rule => rule.active)
            .sort((a, b) => a.priority - b.priority);
        for (const rule of activeRules) {
            if (this.evaluateConditions(rule.conditions, channel, content, context)) {
                return rule;
            }
        }
        return null;
    }
    evaluateConditions(conditions, channel, content, context) {
        for (const condition of conditions) {
            let contextValue;
            switch (condition.field) {
                case 'channel':
                    contextValue = channel;
                    break;
                case 'content':
                    contextValue = content;
                    break;
                default:
                    if (context && condition.field.startsWith('context.')) {
                        const contextKey = condition.field.substring(8);
                        contextValue = context[contextKey];
                    }
                    break;
            }
            switch (condition.operator) {
                case 'equals':
                case '==':
                    if (contextValue != condition.value)
                        return false;
                    break;
                case 'notEquals':
                case '!=':
                    if (contextValue == condition.value)
                        return false;
                    break;
                case 'contains':
                    if (typeof contextValue === 'string' && !contextValue.includes(condition.value))
                        return false;
                    break;
                case 'startsWith':
                    if (typeof contextValue === 'string' && !contextValue.startsWith(condition.value))
                        return false;
                    break;
                case 'endsWith':
                    if (typeof contextValue === 'string' && !contextValue.endsWith(condition.value))
                        return false;
                    break;
                case 'greaterThan':
                case '>':
                    if (contextValue <= condition.value)
                        return false;
                    break;
                case 'lessThan':
                case '<':
                    if (contextValue >= condition.value)
                        return false;
                    break;
                default:
                    this.logger.warn(`Unknown operator: ${condition.operator}`);
                    return false;
            }
        }
        return true;
    }
    applyFormatter(formatter, channel, content, context) {
        switch (formatter.type) {
            case 'template':
                if (formatter.templateId) {
                    const variables = formatter.parameters?.variables || {};
                    const formattedContent = this.formatWithTemplate(formatter.templateId, variables);
                    return {
                        channel,
                        content: formattedContent,
                        contentType: 'text',
                        metadata: formatter.parameters,
                    };
                }
                break;
            case 'transformation':
                if (formatter.transformation) {
                    const transformedContent = this.applyTransformation(formatter.transformation, content, context);
                    return {
                        channel,
                        content: transformedContent,
                        contentType: 'text',
                        metadata: formatter.parameters,
                    };
                }
                break;
            default:
                this.logger.warn(`Unknown formatter type: ${formatter.type}`);
                break;
        }
        return this.getDefaultFormatting(channel, content, context);
    }
    applyTransformation(transformation, content, context) {
        switch (transformation) {
            case 'uppercase':
                return content.toUpperCase();
            case 'lowercase':
                return content.toLowerCase();
            case 'capitalize':
                return content.charAt(0).toUpperCase() + content.slice(1);
            case 'truncate':
                const maxLength = context?.maxLength || 100;
                return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
            default:
                this.logger.warn(`Unknown transformation: ${transformation}`);
                return content;
        }
    }
    getDefaultFormatting(channel, content, context) {
        switch (channel) {
            case 'whatsapp':
                return {
                    channel: 'whatsapp',
                    content: this.formatForWhatsApp(content),
                    contentType: 'text',
                };
            case 'instagram':
                return {
                    channel: 'instagram',
                    content: this.truncateForInstagram(content),
                    contentType: 'text',
                };
            case 'facebook':
                return {
                    channel: 'facebook',
                    content: this.formatForFacebook(content),
                    contentType: 'text',
                };
            case 'email':
                const isHtml = context?.isHtml || false;
                return {
                    channel: 'email',
                    content: isHtml ? this.formatForEmailHtml(content) : content,
                    contentType: isHtml ? 'html' : 'text',
                };
            default:
                return {
                    channel,
                    content,
                    contentType: 'text',
                };
        }
    }
    formatForWhatsApp(content) {
        return content;
    }
    truncateForInstagram(content) {
        const maxLength = 1000;
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }
    formatForFacebook(content) {
        return content;
    }
    formatForEmailHtml(content) {
        return `<p>${content.replace(/\n/g, '</p><p>')}</p>`;
    }
    initializeDefaultTemplates() {
        this.addTemplate({
            id: 'whatsapp-welcome',
            name: 'WhatsApp Welcome Message',
            channel: 'whatsapp',
            template: 'Hello {{name}}! Welcome to our service. How can we help you today?',
            variables: ['name'],
            createdAt: new Date(),
        });
        this.addTemplate({
            id: 'facebook-quick-replies',
            name: 'Facebook Quick Replies',
            channel: 'facebook',
            template: '{{message}}\n\nPlease select an option:\n{{options}}',
            variables: ['message', 'options'],
            createdAt: new Date(),
        });
        this.addTemplate({
            id: 'email-template',
            name: 'Email Template',
            channel: 'email',
            template: 'Dear {{name}},\n\n{{message}}\n\nBest regards,\n{{signature}}',
            variables: ['name', 'message', 'signature'],
            createdAt: new Date(),
        });
    }
};
exports.ResponseFormattingService = ResponseFormattingService;
exports.ResponseFormattingService = ResponseFormattingService = ResponseFormattingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ResponseFormattingService);
//# sourceMappingURL=response-formatting.service.js.map