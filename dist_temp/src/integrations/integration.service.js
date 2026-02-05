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
var IntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const oauth_controller_1 = require("../oauth/oauth.controller");
let IntegrationService = IntegrationService_1 = class IntegrationService {
    constructor(httpService, oauthController) {
        this.httpService = httpService;
        this.oauthController = oauthController;
        this.logger = new common_1.Logger(IntegrationService_1.name);
    }
    async sendEmail(sessionId, message, provider = 'google') {
        try {
            const accessToken = await this.oauthController.getAccountToken(sessionId, provider);
            if (!accessToken) {
                throw new Error(`No ${provider} account connected for email sending`);
            }
            if (provider === 'google') {
                return this.sendGmailEmail(accessToken, message);
            }
            else {
                return this.sendOutlookEmail(accessToken, message);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send email via ${provider}:`, error.message);
            throw error;
        }
    }
    async sendGmailEmail(accessToken, message) {
        try {
            const emailLines = [];
            emailLines.push(`To: ${message.to.join(', ')}`);
            if (message.cc?.length)
                emailLines.push(`Cc: ${message.cc.join(', ')}`);
            if (message.bcc?.length)
                emailLines.push(`Bcc: ${message.bcc.join(', ')}`);
            emailLines.push(`Subject: ${message.subject}`);
            emailLines.push(`Content-Type: ${message.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`);
            emailLines.push('');
            emailLines.push(message.body);
            const rawEmail = emailLines.join('\r\n');
            const encodedEmail = Buffer.from(rawEmail)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { raw: encodedEmail }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log('Email sent successfully via Gmail');
            return response.data;
        }
        catch (error) {
            this.logger.error('Gmail send failed:', error.response?.data || error.message);
            throw new Error(`Gmail send failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async sendOutlookEmail(accessToken, message) {
        try {
            const emailPayload = {
                message: {
                    subject: message.subject,
                    body: {
                        contentType: message.isHtml ? 'HTML' : 'Text',
                        content: message.body,
                    },
                    toRecipients: message.to.map((email) => ({
                        emailAddress: { address: email },
                    })),
                    ccRecipients: message.cc?.map((email) => ({
                        emailAddress: { address: email },
                    })) || [],
                    bccRecipients: message.bcc?.map((email) => ({
                        emailAddress: { address: email },
                    })) || [],
                },
                saveToSentItems: true,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://graph.microsoft.com/v1.0/me/sendMail', emailPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log('Email sent successfully via Outlook');
            return { success: true, messageId: 'outlook_' + Date.now() };
        }
        catch (error) {
            this.logger.error('Outlook send failed:', error.response?.data || error.message);
            throw new Error(`Outlook send failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async createCalendarEvent(sessionId, event, provider = 'google-calendar') {
        try {
            const accessToken = await this.oauthController.getAccountToken(sessionId, provider);
            if (!accessToken) {
                throw new Error(`No ${provider} account connected for calendar access`);
            }
            if (provider === 'google-calendar') {
                return this.createGoogleCalendarEvent(accessToken, event);
            }
            else {
                return this.createOutlookCalendarEvent(accessToken, event);
            }
        }
        catch (error) {
            this.logger.error(`Failed to create calendar event via ${provider}:`, error.message);
            throw error;
        }
    }
    async createGoogleCalendarEvent(accessToken, event) {
        try {
            const eventPayload = {
                summary: event.title,
                description: event.description,
                location: event.location,
                start: {
                    dateTime: event.startTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: event.endTime.toISOString(),
                    timeZone: 'UTC',
                },
            };
            if (event.isAllDay) {
                eventPayload.start = {
                    date: event.startTime.toISOString().split('T')[0],
                };
                eventPayload.end = { date: event.endTime.toISOString().split('T')[0] };
            }
            if (event.attendees?.length) {
                eventPayload.attendees = event.attendees.map((email) => ({ email }));
            }
            if (event.recurrence) {
                const rrule = this.buildGoogleRecurrenceRule(event.recurrence);
                eventPayload.recurrence = [rrule];
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', eventPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log('Calendar event created successfully in Google Calendar');
            return response.data;
        }
        catch (error) {
            this.logger.error('Google Calendar create failed:', error.response?.data || error.message);
            throw new Error(`Google Calendar create failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async createOutlookCalendarEvent(accessToken, event) {
        try {
            const eventPayload = {
                subject: event.title,
                body: {
                    contentType: 'HTML',
                    content: event.description || '',
                },
                start: {
                    dateTime: event.startTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: event.endTime.toISOString(),
                    timeZone: 'UTC',
                },
                location: {
                    displayName: event.location || '',
                },
                isAllDay: event.isAllDay || false,
            };
            if (event.attendees?.length) {
                eventPayload.attendees = event.attendees.map((email) => ({
                    emailAddress: { address: email, name: email },
                    type: 'required',
                }));
            }
            if (event.recurrence) {
                eventPayload.recurrence = this.buildOutlookRecurrencePattern(event.recurrence);
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://graph.microsoft.com/v1.0/me/events', eventPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log('Calendar event created successfully in Outlook Calendar');
            return response.data;
        }
        catch (error) {
            this.logger.error('Outlook Calendar create failed:', error.response?.data || error.message);
            throw new Error(`Outlook Calendar create failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async uploadToYouTube(sessionId, videoData) {
        try {
            const accessToken = await this.oauthController.getAccountToken(sessionId, 'youtube');
            if (!accessToken) {
                throw new Error('No YouTube account connected');
            }
            const metadata = {
                snippet: {
                    title: videoData.title,
                    description: videoData.description,
                    tags: videoData.tags || [],
                    categoryId: '22',
                },
                status: {
                    privacyStatus: 'private',
                },
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
                metadata: JSON.stringify(metadata),
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/related',
                },
            }));
            this.logger.log('Video uploaded successfully to YouTube');
            return response.data;
        }
        catch (error) {
            this.logger.error('YouTube upload failed:', error.response?.data || error.message);
            throw new Error(`YouTube upload failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    async postToSocialMedia(sessionId, platform, content) {
        try {
            const accessToken = await this.oauthController.getAccountToken(sessionId, platform);
            if (!accessToken) {
                throw new Error(`No ${platform} account connected`);
            }
            switch (platform) {
                case 'facebook':
                    return this.postToFacebook(accessToken, content);
                case 'instagram':
                    return this.postToInstagram(accessToken, content);
                case 'linkedin':
                    return this.postToLinkedIn(accessToken, content);
                case 'twitter':
                    return this.postToTwitter(accessToken, content);
                default:
                    throw new Error(`Posting to ${platform} not implemented yet`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to post to ${platform}:`, error.message);
            throw error;
        }
    }
    async postToFacebook(accessToken, content) {
        const payload = {
            message: content.text,
        };
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://graph.facebook.com/me/feed', payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }));
        return response.data;
    }
    async postToInstagram(accessToken, content) {
        throw new Error('Instagram posting requires media upload - implementation pending');
    }
    async postToLinkedIn(accessToken, content) {
        const payload = {
            content: {
                contentEntities: [],
                title: content.text.substring(0, 200),
            },
            distribution: {
                feedDistribution: 'MAIN_FEED',
                targetEntities: [],
                thirdPartyDistributionChannels: [],
            },
            text: {
                text: content.text,
            },
        };
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://api.linkedin.com/v2/shares', payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }));
        return response.data;
    }
    async postToTwitter(accessToken, content) {
        const payload = {
            text: content.text,
        };
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://api.twitter.com/2/tweets', payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }));
        return response.data;
    }
    buildGoogleRecurrenceRule(recurrence) {
        if (!recurrence)
            return '';
        const freq = recurrence.frequency.toUpperCase();
        let rrule = `RRULE:FREQ=${freq};INTERVAL=${recurrence.interval}`;
        if (recurrence.until) {
            rrule += `;UNTIL=${recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
        }
        return rrule;
    }
    buildOutlookRecurrencePattern(recurrence) {
        if (!recurrence)
            return null;
        return {
            pattern: {
                type: recurrence.frequency,
                interval: recurrence.interval,
            },
            range: {
                type: recurrence.until ? 'endDate' : 'noEnd',
                endDate: recurrence.until?.toISOString().split('T')[0],
            },
        };
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = IntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        oauth_controller_1.OAuthController])
], IntegrationService);
//# sourceMappingURL=integration.service.js.map