"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextCompressionService = void 0;
const common_1 = require("@nestjs/common");
let ContextCompressionService = class ContextCompressionService {
    compressConversationHistory(conversations, maxContextLength = 5) {
        const sortedConversations = [...conversations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const recentConversations = sortedConversations.slice(0, maxContextLength);
        if (recentConversations.length > 3) {
            return this.summarizeOlderConversations(recentConversations);
        }
        return recentConversations;
    }
    summarizeOlderConversations(conversations) {
        const detailedConversations = conversations.slice(0, 2);
        const summarizedConversations = conversations.slice(2).map((conv) => ({
            ...conv,
            userMessage: this.summarizeText(conv.userMessage, 50),
            agentResponse: this.summarizeText(conv.agentResponse, 50),
            collectedInfo: this.compressCollectedInfo(conv.collectedInfo),
        }));
        return [...detailedConversations, ...summarizedConversations];
    }
    summarizeText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }
    compressCollectedInfo(info) {
        if (!info)
            return info;
        const compressedInfo = { ...info };
        Object.keys(compressedInfo).forEach((key) => {
            if (compressedInfo[key] === null ||
                compressedInfo[key] === undefined ||
                compressedInfo[key] === '') {
                delete compressedInfo[key];
            }
        });
        return compressedInfo;
    }
    extractKeyContext(conversations) {
        if (conversations.length === 0) {
            return {
                objective: '',
                targetAgent: '',
                collectedInfo: {},
                confidence: 0,
                emotion: '',
                entities: {},
                context: {},
            };
        }
        const latestConversation = conversations[0];
        return {
            objective: latestConversation.objective,
            targetAgent: latestConversation.targetAgent,
            collectedInfo: latestConversation.collectedInfo,
            confidence: latestConversation.confidence || 0,
            emotion: latestConversation.emotion || '',
            entities: latestConversation.entities || {},
            context: latestConversation.context || {},
        };
    }
    generateContextSummary(conversations) {
        if (conversations.length === 0) {
            return {
                summary: 'No conversation history',
                keyPoints: [],
                lastObjective: '',
                completionStatus: 'incomplete',
                emotion: '',
                entities: {},
            };
        }
        const latest = conversations[0];
        let summary = '';
        const keyPoints = [];
        if (latest.objective) {
            summary += `Objective: ${latest.objective}. `;
            keyPoints.push(`Objective: ${latest.objective}`);
        }
        if (latest.targetAgent) {
            summary += `Target Agent: ${latest.targetAgent}. `;
            keyPoints.push(`Target Agent: ${latest.targetAgent}`);
        }
        if (latest.missingInfo && latest.missingInfo.length > 0) {
            summary += `Missing Info: ${latest.missingInfo.join(', ')}. `;
            keyPoints.push(`Missing Info: ${latest.missingInfo.join(', ')}`);
        }
        if (latest.collectedInfo) {
            Object.entries(latest.collectedInfo).forEach(([key, value]) => {
                keyPoints.push(`${key}: ${String(value)}`);
            });
        }
        if (latest.emotion) {
            summary += `Emotion: ${latest.emotion}. `;
            keyPoints.push(`Emotion: ${latest.emotion}`);
        }
        return {
            summary: summary.trim() || 'Conversation in progress',
            keyPoints,
            lastObjective: latest.objective,
            completionStatus: latest.targetAgent ? 'complete' : 'incomplete',
            emotion: latest.emotion || '',
            entities: latest.entities || {},
        };
    }
};
exports.ContextCompressionService = ContextCompressionService;
exports.ContextCompressionService = ContextCompressionService = __decorate([
    (0, common_1.Injectable)()
], ContextCompressionService);
//# sourceMappingURL=context-compression.service.js.map