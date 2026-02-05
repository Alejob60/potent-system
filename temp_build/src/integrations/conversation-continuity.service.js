"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConversationContinuityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationContinuityService = void 0;
const common_1 = require("@nestjs/common");
let ConversationContinuityService = ConversationContinuityService_1 = class ConversationContinuityService {
    constructor() {
        this.logger = new common_1.Logger(ConversationContinuityService_1.name);
        this.conversations = new Map();
        this.transitions = new Map();
    }
    startCrossChannelConversation(recipientId, initialChannel, initialConversationId, tenantId, contextId) {
        try {
            const conversationId = this.generateConversationId(recipientId);
            const conversation = {
                id: conversationId,
                recipientId,
                tenantId,
                channels: [
                    {
                        channelId: initialChannel,
                        conversationId: initialConversationId,
                        startedAt: new Date(),
                        isActive: true,
                    },
                ],
                contextId: contextId || this.generateContextId(recipientId),
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
            };
            this.conversations.set(conversationId, conversation);
            this.logger.log(`Started cross-channel conversation ${conversationId} for recipient ${recipientId}`);
            return conversation;
        }
        catch (error) {
            this.logger.error(`Failed to start cross-channel conversation: ${error.message}`);
            throw new Error(`Failed to start cross-channel conversation: ${error.message}`);
        }
    }
    addChannelToConversation(conversationId, channelId, conversationIdInChannel) {
        try {
            const conversation = this.conversations.get(conversationId);
            if (!conversation) {
                throw new Error(`Cross-channel conversation ${conversationId} not found`);
            }
            if (!conversation.isActive) {
                throw new Error(`Cross-channel conversation ${conversationId} is not active`);
            }
            const previousChannel = conversation.channels.find(channel => channel.isActive);
            if (previousChannel) {
                previousChannel.isActive = false;
                previousChannel.endedAt = new Date();
            }
            conversation.channels.push({
                channelId,
                conversationId: conversationIdInChannel,
                startedAt: new Date(),
                isActive: true,
            });
            conversation.updatedAt = new Date();
            this.conversations.set(conversationId, conversation);
            this.recordTransition(conversationId, previousChannel?.channelId || '', channelId, 'channel_switch');
            this.logger.log(`Added channel ${channelId} to cross-channel conversation ${conversationId}`);
            return conversation;
        }
        catch (error) {
            this.logger.error(`Failed to add channel to conversation: ${error.message}`);
            throw new Error(`Failed to add channel to conversation: ${error.message}`);
        }
    }
    getCrossChannelConversation(conversationId) {
        return this.conversations.get(conversationId) || null;
    }
    getConversationsForRecipient(recipientId) {
        const result = [];
        for (const conversation of this.conversations.values()) {
            if (conversation.recipientId === recipientId) {
                result.push(conversation);
            }
        }
        return result;
    }
    endCrossChannelConversation(conversationId) {
        try {
            const conversation = this.conversations.get(conversationId);
            if (!conversation) {
                return false;
            }
            conversation.isActive = false;
            conversation.updatedAt = new Date();
            conversation.channels.forEach(channel => {
                if (channel.isActive) {
                    channel.isActive = false;
                    channel.endedAt = new Date();
                }
            });
            this.conversations.set(conversationId, conversation);
            this.logger.log(`Ended cross-channel conversation ${conversationId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to end cross-channel conversation: ${error.message}`);
            return false;
        }
    }
    recordTransition(conversationId, fromChannel, toChannel, reason, metadata) {
        try {
            if (!this.transitions.has(conversationId)) {
                this.transitions.set(conversationId, []);
            }
            const transitions = this.transitions.get(conversationId);
            transitions.push({
                fromChannel,
                toChannel,
                reason,
                timestamp: new Date(),
                metadata,
            });
            this.transitions.set(conversationId, transitions);
            this.logger.log(`Recorded transition from ${fromChannel} to ${toChannel} for conversation ${conversationId}`);
        }
        catch (error) {
            this.logger.error(`Failed to record transition: ${error.message}`);
        }
    }
    getTransitions(conversationId) {
        return this.transitions.get(conversationId) || [];
    }
    findActiveConversationForRecipient(recipientId) {
        for (const conversation of this.conversations.values()) {
            if (conversation.recipientId === recipientId && conversation.isActive) {
                return conversation;
            }
        }
        return null;
    }
    generateConversationId(recipientId) {
        return `cc-${recipientId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateContextId(recipientId) {
        return `ctx-${recipientId}`;
    }
};
exports.ConversationContinuityService = ConversationContinuityService;
exports.ConversationContinuityService = ConversationContinuityService = ConversationContinuityService_1 = __decorate([
    (0, common_1.Injectable)()
], ConversationContinuityService);
//# sourceMappingURL=conversation-continuity.service.js.map