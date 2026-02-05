/// <reference types="node" />
/// <reference types="node" />
export interface VoiceConsentEntity {
    id: string;
    tenantId: string;
    userId: string;
    sessionId: string;
    consentType: 'recording' | 'storage' | 'transcription' | 'analysis';
    granted: boolean;
    grantedAt: Date;
    expiresAt?: Date;
    revokedAt?: Date;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
export interface RecordingMetadata {
    recordingId: string;
    tenantId: string;
    sessionId: string;
    userId: string;
    channel: 'voice' | 'call';
    duration: number;
    format: string;
    blobUrl: string;
    transcription?: string;
    consentId: string;
    createdAt: Date;
    expiresAt: Date;
}
export declare class VoiceConsentService {
    private readonly logger;
    private readonly blobServiceClient;
    private readonly recordingsContainer;
    private readonly defaultRetentionDays;
    constructor();
    onModuleInit(): Promise<void>;
    requestConsent(tenantId: string, userId: string, sessionId: string, consentType: VoiceConsentEntity['consentType']): Promise<string>;
    grantConsent(consentId: string): Promise<boolean>;
    revokeConsent(consentId: string, reason?: string): Promise<boolean>;
    hasConsent(tenantId: string, userId: string, consentType: VoiceConsentEntity['consentType']): Promise<boolean>;
    uploadRecording(audioBuffer: Buffer, metadata: Omit<RecordingMetadata, 'blobUrl' | 'createdAt' | 'expiresAt'>): Promise<string>;
    downloadRecording(recordingId: string, tenantId: string): Promise<Buffer>;
    deleteRecording(recordingId: string, tenantId: string): Promise<boolean>;
    deleteRecordingsByConsent(consentId: string): Promise<number>;
    getRecordingMetadata(recordingId: string, tenantId: string): Promise<RecordingMetadata | null>;
    cleanupExpiredRecordings(): Promise<number>;
    generateRecordingAccessToken(recordingId: string, tenantId: string, expiresInMinutes?: number): Promise<string>;
}
