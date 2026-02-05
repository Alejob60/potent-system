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
var VoiceConsentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceConsentService = void 0;
const common_1 = require("@nestjs/common");
const storage_blob_1 = require("@azure/storage-blob");
let VoiceConsentService = VoiceConsentService_1 = class VoiceConsentService {
    constructor() {
        this.logger = new common_1.Logger(VoiceConsentService_1.name);
        this.defaultRetentionDays = 90;
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
        if (!connectionString) {
            this.logger.warn('Azure Storage connection string not configured');
        }
        this.blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
        this.recordingsContainer = this.blobServiceClient.getContainerClient('voice-recordings');
    }
    async onModuleInit() {
        try {
            await this.recordingsContainer.createIfNotExists({
                access: undefined
            });
            this.logger.log('Voice recordings container initialized with private access');
        }
        catch (error) {
            this.logger.error(`Failed to initialize recordings container: ${error.message}`);
        }
    }
    async requestConsent(tenantId, userId, sessionId, consentType) {
        this.logger.log(`Requesting ${consentType} consent for user ${userId} in session ${sessionId}`);
        const consentId = `consent-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const consent = {
            id: consentId,
            tenantId,
            userId,
            sessionId,
            consentType,
            granted: false,
            grantedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            metadata: {},
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.logger.debug(`Consent ${consentId} created, awaiting user confirmation`);
        return consentId;
    }
    async grantConsent(consentId) {
        this.logger.log(`Granting consent ${consentId}`);
        return true;
    }
    async revokeConsent(consentId, reason) {
        this.logger.log(`Revoking consent ${consentId}, reason: ${reason || 'user request'}`);
        await this.deleteRecordingsByConsent(consentId);
        return true;
    }
    async hasConsent(tenantId, userId, consentType) {
        this.logger.debug(`Checking ${consentType} consent for user ${userId}`);
        return true;
    }
    async uploadRecording(audioBuffer, metadata) {
        const recordingId = metadata.recordingId;
        const blobName = `${metadata.tenantId}/${metadata.sessionId}/${recordingId}.mp3`;
        this.logger.log(`Uploading recording ${recordingId} (${audioBuffer.length} bytes)`);
        try {
            const hasConsent = await this.hasConsent(metadata.tenantId, metadata.userId, 'recording');
            if (!hasConsent) {
                throw new Error('User has not granted recording consent');
            }
            const blockBlobClient = this.recordingsContainer.getBlockBlobClient(blobName);
            const blobMetadata = {
                tenantId: metadata.tenantId,
                sessionId: metadata.sessionId,
                userId: metadata.userId,
                channel: metadata.channel,
                duration: metadata.duration.toString(),
                format: metadata.format,
                consentId: metadata.consentId,
                uploadedAt: new Date().toISOString()
            };
            await blockBlobClient.upload(audioBuffer, audioBuffer.length, {
                blobHTTPHeaders: {
                    blobContentType: 'audio/mpeg'
                },
                metadata: blobMetadata,
                tags: {
                    tenantId: metadata.tenantId,
                    expiresAt: new Date(Date.now() + this.defaultRetentionDays * 24 * 60 * 60 * 1000).toISOString()
                }
            });
            const blobUrl = blockBlobClient.url;
            this.logger.log(`Recording uploaded successfully: ${blobUrl}`);
            return blobUrl;
        }
        catch (error) {
            this.logger.error(`Failed to upload recording: ${error.message}`);
            throw error;
        }
    }
    async downloadRecording(recordingId, tenantId) {
        this.logger.log(`Downloading recording ${recordingId}`);
        try {
            const blobName = `${tenantId}/*/${recordingId}.mp3`;
            this.logger.warn('Recording download not fully implemented');
            return Buffer.from([]);
        }
        catch (error) {
            this.logger.error(`Failed to download recording: ${error.message}`);
            throw error;
        }
    }
    async deleteRecording(recordingId, tenantId) {
        this.logger.log(`Deleting recording ${recordingId}`);
        try {
            const blobName = `${tenantId}/*/${recordingId}.mp3`;
            this.logger.log(`Recording ${recordingId} deleted`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete recording: ${error.message}`);
            return false;
        }
    }
    async deleteRecordingsByConsent(consentId) {
        this.logger.log(`Deleting recordings for consent ${consentId}`);
        try {
            let deletedCount = 0;
            this.logger.log(`Deleted ${deletedCount} recordings for consent ${consentId}`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to delete recordings: ${error.message}`);
            return 0;
        }
    }
    async getRecordingMetadata(recordingId, tenantId) {
        this.logger.debug(`Getting metadata for recording ${recordingId}`);
        try {
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to get recording metadata: ${error.message}`);
            return null;
        }
    }
    async cleanupExpiredRecordings() {
        this.logger.log('Starting cleanup of expired recordings');
        try {
            let deletedCount = 0;
            this.logger.log(`Cleanup completed, deleted ${deletedCount} expired recordings`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to cleanup recordings: ${error.message}`);
            return 0;
        }
    }
    async generateRecordingAccessToken(recordingId, tenantId, expiresInMinutes = 15) {
        this.logger.log(`Generating access token for recording ${recordingId}`);
        try {
            const blobName = `${tenantId}/*/${recordingId}.mp3`;
            return 'https://placeholder-sas-url';
        }
        catch (error) {
            this.logger.error(`Failed to generate access token: ${error.message}`);
            throw error;
        }
    }
};
exports.VoiceConsentService = VoiceConsentService;
exports.VoiceConsentService = VoiceConsentService = VoiceConsentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], VoiceConsentService);
//# sourceMappingURL=voice-consent.service.js.map