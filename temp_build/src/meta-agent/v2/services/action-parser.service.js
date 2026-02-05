"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ActionParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionParserService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const BaseActionSchema = zod_1.z.object({
    type: zod_1.z.string().min(1),
    params: zod_1.z.record(zod_1.z.any()),
    target: zod_1.z.string().optional(),
});
const CreateOrderActionSchema = BaseActionSchema.extend({
    type: zod_1.z.literal('create_order'),
    params: zod_1.z.object({
        productId: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        customerId: zod_1.z.string().optional(),
        shippingAddress: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
const GenerateVideoActionSchema = BaseActionSchema.extend({
    type: zod_1.z.literal('generate_video'),
    params: zod_1.z.object({
        script: zod_1.z.string(),
        duration: zod_1.z.number().positive().optional(),
        style: zod_1.z.string().optional(),
        voiceOver: zod_1.z.boolean().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
const SchedulePostActionSchema = BaseActionSchema.extend({
    type: zod_1.z.literal('schedule_post'),
    params: zod_1.z.object({
        content: zod_1.z.string(),
        platform: zod_1.z.enum(['instagram', 'facebook', 'twitter', 'linkedin']),
        scheduledTime: zod_1.z.string().datetime().optional(),
        mediaUrls: zod_1.z.array(zod_1.z.string()).optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
const InitiateCallActionSchema = BaseActionSchema.extend({
    type: zod_1.z.literal('initiate_call'),
    params: zod_1.z.object({
        phoneNumber: zod_1.z.string(),
        purpose: zod_1.z.string().optional(),
        script: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
const EscalateToHumanActionSchema = BaseActionSchema.extend({
    type: zod_1.z.literal('escalate_to_human'),
    params: zod_1.z.object({
        reason: zod_1.z.string(),
        priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        department: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
let ActionParserService = ActionParserService_1 = class ActionParserService {
    constructor() {
        this.logger = new common_1.Logger(ActionParserService_1.name);
        this.actionPattern = /<ACTION>(.*?)<\/ACTION>/gs;
    }
    parseActions(responseText) {
        const actions = [];
        try {
            const matches = responseText.matchAll(this.actionPattern);
            for (const match of matches) {
                const actionJson = match[1].trim();
                try {
                    const actionData = JSON.parse(actionJson);
                    const validatedAction = this.validateAction(actionData);
                    if (validatedAction) {
                        actions.push({
                            type: validatedAction.type,
                            params: validatedAction.params,
                            status: 'pending',
                            target: validatedAction.target || this.getDefaultTarget(validatedAction.type)
                        });
                        this.logger.debug(`Parsed action: ${validatedAction.type}`);
                    }
                }
                catch (parseError) {
                    this.logger.warn(`Failed to parse action JSON: ${actionJson}`, parseError.message);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error parsing actions: ${error.message}`);
        }
        this.logger.debug(`Parsed ${actions.length} action(s) from response`);
        return actions;
    }
    validateAction(actionData) {
        try {
            switch (actionData.type) {
                case 'create_order':
                    return CreateOrderActionSchema.parse(actionData);
                case 'generate_video':
                    return GenerateVideoActionSchema.parse(actionData);
                case 'schedule_post':
                    return SchedulePostActionSchema.parse(actionData);
                case 'initiate_call':
                    return InitiateCallActionSchema.parse(actionData);
                case 'escalate_to_human':
                    return EscalateToHumanActionSchema.parse(actionData);
                default:
                    this.logger.warn(`Unknown action type: ${actionData.type}, using base validation`);
                    return BaseActionSchema.parse(actionData);
            }
        }
        catch (validationError) {
            this.logger.error(`Action validation failed for type "${actionData.type}":`, validationError.message);
            return null;
        }
    }
    getDefaultTarget(actionType) {
        const targetMap = {
            create_order: 'orders-service',
            generate_video: 'video-generator-service',
            schedule_post: 'post-scheduler-service',
            initiate_call: 'voice-service',
            escalate_to_human: 'support-service'
        };
        return targetMap[actionType] || 'default-service';
    }
    extractCleanResponse(responseText) {
        return responseText.replace(this.actionPattern, '').trim();
    }
    validateActionParams(action) {
        const errors = [];
        if (!action.type || action.type.trim() === '') {
            errors.push('Action type is required');
        }
        if (!action.params || Object.keys(action.params).length === 0) {
            errors.push('Action params cannot be empty');
        }
        switch (action.type) {
            case 'create_order':
                if (!action.params.productId) {
                    errors.push('productId is required for create_order action');
                }
                if (!action.params.quantity || action.params.quantity <= 0) {
                    errors.push('quantity must be a positive number');
                }
                break;
            case 'generate_video':
                if (!action.params.script || action.params.script.trim() === '') {
                    errors.push('script is required for generate_video action');
                }
                break;
            case 'schedule_post':
                if (!action.params.content || action.params.content.trim() === '') {
                    errors.push('content is required for schedule_post action');
                }
                if (!action.params.platform) {
                    errors.push('platform is required for schedule_post action');
                }
                break;
            case 'initiate_call':
                if (!action.params.phoneNumber) {
                    errors.push('phoneNumber is required for initiate_call action');
                }
                break;
            case 'escalate_to_human':
                if (!action.params.reason) {
                    errors.push('reason is required for escalate_to_human action');
                }
                break;
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    buildActionExample(actionType) {
        const examples = {
            create_order: '<ACTION>{"type":"create_order","params":{"productId":"prod-123","quantity":2},"target":"orders-service"}</ACTION>',
            generate_video: '<ACTION>{"type":"generate_video","params":{"script":"Video script here","duration":30},"target":"video-generator-service"}</ACTION>',
            schedule_post: '<ACTION>{"type":"schedule_post","params":{"content":"Post content","platform":"instagram"},"target":"post-scheduler-service"}</ACTION>',
            initiate_call: '<ACTION>{"type":"initiate_call","params":{"phoneNumber":"+1234567890","purpose":"Follow-up"},"target":"voice-service"}</ACTION>',
            escalate_to_human: '<ACTION>{"type":"escalate_to_human","params":{"reason":"Complex issue","priority":"high"},"target":"support-service"}</ACTION>'
        };
        return examples[actionType] || '<ACTION>{"type":"unknown","params":{}}</ACTION>';
    }
};
exports.ActionParserService = ActionParserService;
exports.ActionParserService = ActionParserService = ActionParserService_1 = __decorate([
    (0, common_1.Injectable)()
], ActionParserService);
//# sourceMappingURL=action-parser.service.js.map