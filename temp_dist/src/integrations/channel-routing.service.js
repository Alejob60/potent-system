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
var ChannelRoutingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelRoutingService = void 0;
const common_1 = require("@nestjs/common");
let ChannelRoutingService = ChannelRoutingService_1 = class ChannelRoutingService {
    constructor() {
        this.logger = new common_1.Logger(ChannelRoutingService_1.name);
        this.routingRules = new Map();
        this.channelPriorities = new Map();
        this.setDefaultChannelPriorities();
    }
    addRoutingRule(rule) {
        this.routingRules.set(rule.id, rule);
        this.logger.log(`Added routing rule: ${rule.name}`);
    }
    removeRoutingRule(ruleId) {
        this.routingRules.delete(ruleId);
        this.logger.log(`Removed routing rule: ${ruleId}`);
    }
    getRoutingRules() {
        return Array.from(this.routingRules.values());
    }
    routeMessage(context) {
        try {
            const matchingRule = this.findMatchingRule(context);
            if (matchingRule) {
                const action = matchingRule.actions[0];
                return {
                    channel: action.channel,
                    template: action.template,
                    parameters: action.parameters,
                };
            }
            return this.getDefaultRouting(context);
        }
        catch (error) {
            this.logger.error(`Error routing message: ${error.message}`);
            return this.getDefaultRouting(context);
        }
    }
    setChannelPriority(channel, priority) {
        this.channelPriorities.set(channel, priority);
        this.logger.log(`Set priority ${priority} for channel ${channel}`);
    }
    getChannelPriorities() {
        return new Map(this.channelPriorities);
    }
    findMatchingRule(context) {
        const activeRules = Array.from(this.routingRules.values())
            .filter(rule => rule.active)
            .sort((a, b) => a.priority - b.priority);
        for (const rule of activeRules) {
            if (this.evaluateConditions(rule.conditions, context)) {
                return rule;
            }
        }
        return null;
    }
    evaluateConditions(conditions, context) {
        for (const condition of conditions) {
            let contextValue;
            if (condition.field.startsWith('metadata.')) {
                const metadataKey = condition.field.substring(9);
                contextValue = context.metadata[metadataKey];
            }
            else {
                contextValue = context[condition.field];
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
    getDefaultRouting(context) {
        if (context.channelId) {
            return { channel: context.channelId };
        }
        const sortedChannels = Array.from(this.channelPriorities.entries())
            .sort((a, b) => a[1] - b[1])
            .map(([channel, _]) => channel);
        if (sortedChannels.length > 0) {
            return { channel: sortedChannels[0] };
        }
        return { channel: 'whatsapp' };
    }
    setDefaultChannelPriorities() {
        this.setChannelPriority('whatsapp', 1);
        this.setChannelPriority('facebook', 2);
        this.setChannelPriority('instagram', 3);
        this.setChannelPriority('email', 4);
    }
};
exports.ChannelRoutingService = ChannelRoutingService;
exports.ChannelRoutingService = ChannelRoutingService = ChannelRoutingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ChannelRoutingService);
//# sourceMappingURL=channel-routing.service.js.map