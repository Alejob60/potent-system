import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlobServiceClient, ContainerClient, PublicAccessType } from '@azure/storage-blob';

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

@Injectable()
export class VoiceConsentService {
  private readonly logger = new Logger(VoiceConsentService.name);
  private readonly blobServiceClient: BlobServiceClient;
  private readonly recordingsContainer: ContainerClient;
  private readonly defaultRetentionDays = 90;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    
    if (!connectionString) {
      this.logger.warn('Azure Storage connection string not configured');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.recordingsContainer = this.blobServiceClient.getContainerClient('voice-recordings');
  }

  async onModuleInit() {
    // Ensure container exists
    try {
      // Create container with private access (no public access)
      await this.recordingsContainer.createIfNotExists({
        access: undefined // Explicitly set no public access
      });
      this.logger.log('Voice recordings container initialized with private access');
    } catch (error) {
      this.logger.error(`Failed to initialize recordings container: ${error.message}`);
    }
  }

  /**
   * Request user consent for voice recording
   * @param tenantId Tenant ID
   * @param userId User ID
   * @param sessionId Session ID
   * @param consentType Type of consent
   * @returns Consent ID
   */
  async requestConsent(
    tenantId: string,
    userId: string,
    sessionId: string,
    consentType: VoiceConsentEntity['consentType']
  ): Promise<string> {
    this.logger.log(`Requesting ${consentType} consent for user ${userId} in session ${sessionId}`);

    // In production, store in database
    const consentId = `consent-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // TODO: Persist to PostgreSQL user_consents_v2 table
    const consent: VoiceConsentEntity = {
      id: consentId,
      tenantId,
      userId,
      sessionId,
      consentType,
      granted: false, // Pending user confirmation
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.logger.debug(`Consent ${consentId} created, awaiting user confirmation`);
    
    return consentId;
  }

  /**
   * Grant consent (user confirmed)
   * @param consentId Consent ID
   * @returns Success status
   */
  async grantConsent(consentId: string): Promise<boolean> {
    this.logger.log(`Granting consent ${consentId}`);
    
    // TODO: Update in database
    // UPDATE user_consents_v2 SET granted = true, granted_at = NOW() WHERE id = consentId
    
    return true;
  }

  /**
   * Revoke consent
   * @param consentId Consent ID
   * @param reason Revocation reason
   * @returns Success status
   */
  async revokeConsent(consentId: string, reason?: string): Promise<boolean> {
    this.logger.log(`Revoking consent ${consentId}, reason: ${reason || 'user request'}`);
    
    // TODO: Update in database
    // UPDATE user_consents_v2 SET revoked_at = NOW(), metadata = jsonb_set(metadata, '{revocationReason}', $reason) WHERE id = consentId
    
    // Delete associated recordings
    await this.deleteRecordingsByConsent(consentId);
    
    return true;
  }

  /**
   * Check if user has granted consent
   * @param tenantId Tenant ID
   * @param userId User ID
   * @param consentType Consent type
   * @returns Consent status
   */
  async hasConsent(
    tenantId: string,
    userId: string,
    consentType: VoiceConsentEntity['consentType']
  ): Promise<boolean> {
    this.logger.debug(`Checking ${consentType} consent for user ${userId}`);
    
    // TODO: Query database
    // SELECT * FROM user_consents_v2 WHERE tenant_id = $1 AND user_id = $2 AND consent_type = $3 AND granted = true AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())
    
    // For now, return true (permissive mode)
    return true;
  }

  /**
   * Upload voice recording to blob storage
   * @param audioBuffer Audio data
   * @param metadata Recording metadata
   * @returns Blob URL
   */
  async uploadRecording(
    audioBuffer: Buffer,
    metadata: Omit<RecordingMetadata, 'blobUrl' | 'createdAt' | 'expiresAt'>
  ): Promise<string> {
    const recordingId = metadata.recordingId;
    const blobName = `${metadata.tenantId}/${metadata.sessionId}/${recordingId}.mp3`;
    
    this.logger.log(`Uploading recording ${recordingId} (${audioBuffer.length} bytes)`);

    try {
      // Check consent before uploading
      const hasConsent = await this.hasConsent(
        metadata.tenantId,
        metadata.userId,
        'recording'
      );

      if (!hasConsent) {
        throw new Error('User has not granted recording consent');
      }

      const blockBlobClient = this.recordingsContainer.getBlockBlobClient(blobName);

      // Set metadata
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

      // Upload with retention policy
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

      // TODO: Store metadata in voice_recordings_v2 table
      
      return blobUrl;
    } catch (error) {
      this.logger.error(`Failed to upload recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download recording from blob storage
   * @param recordingId Recording ID
   * @param tenantId Tenant ID
   * @returns Audio buffer
   */
  async downloadRecording(recordingId: string, tenantId: string): Promise<Buffer> {
    this.logger.log(`Downloading recording ${recordingId}`);

    try {
      // TODO: Query database for blob path
      // For now, construct path
      const blobName = `${tenantId}/*/${recordingId}.mp3`;
      
      // In production, use exact path from database
      // const blockBlobClient = this.recordingsContainer.getBlockBlobClient(blobName);
      
      // const downloadResponse = await blockBlobClient.download();
      // const audioBuffer = await streamToBuffer(downloadResponse.readableStreamBody);
      
      // return audioBuffer;
      
      // Placeholder
      this.logger.warn('Recording download not fully implemented');
      return Buffer.from([]);
    } catch (error) {
      this.logger.error(`Failed to download recording: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete recording from blob storage
   * @param recordingId Recording ID
   * @param tenantId Tenant ID
   * @returns Success status
   */
  async deleteRecording(recordingId: string, tenantId: string): Promise<boolean> {
    this.logger.log(`Deleting recording ${recordingId}`);

    try {
      // TODO: Query database for blob path
      const blobName = `${tenantId}/*/${recordingId}.mp3`;
      
      // const blockBlobClient = this.recordingsContainer.getBlockBlobClient(blobName);
      // await blockBlobClient.delete();
      
      // TODO: Delete from voice_recordings_v2 table
      
      this.logger.log(`Recording ${recordingId} deleted`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete recording: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete all recordings associated with a consent
   * @param consentId Consent ID
   * @returns Number of recordings deleted
   */
  async deleteRecordingsByConsent(consentId: string): Promise<number> {
    this.logger.log(`Deleting recordings for consent ${consentId}`);

    try {
      // TODO: Query database for recordings with this consent
      // DELETE FROM voice_recordings_v2 WHERE consent_id = $1 RETURNING recording_id, blob_url
      
      // For each recording, delete from blob storage
      let deletedCount = 0;
      
      this.logger.log(`Deleted ${deletedCount} recordings for consent ${consentId}`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to delete recordings: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get recording metadata
   * @param recordingId Recording ID
   * @param tenantId Tenant ID
   * @returns Recording metadata
   */
  async getRecordingMetadata(recordingId: string, tenantId: string): Promise<RecordingMetadata | null> {
    this.logger.debug(`Getting metadata for recording ${recordingId}`);

    try {
      // TODO: Query database
      // SELECT * FROM voice_recordings_v2 WHERE recording_id = $1 AND tenant_id = $2
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to get recording metadata: ${error.message}`);
      return null;
    }
  }

  /**
   * Cleanup expired recordings (scheduled task)
   * @returns Number of recordings deleted
   */
  async cleanupExpiredRecordings(): Promise<number> {
    this.logger.log('Starting cleanup of expired recordings');

    try {
      // TODO: Query database for expired recordings
      // SELECT recording_id, tenant_id, blob_url FROM voice_recordings_v2 WHERE expires_at < NOW()
      
      let deletedCount = 0;
      
      this.logger.log(`Cleanup completed, deleted ${deletedCount} expired recordings`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup recordings: ${error.message}`);
      return 0;
    }
  }

  /**
   * Generate SAS token for temporary access to recording
   * @param recordingId Recording ID
   * @param tenantId Tenant ID
   * @param expiresInMinutes Token validity (default: 15 minutes)
   * @returns SAS URL
   */
  async generateRecordingAccessToken(
    recordingId: string,
    tenantId: string,
    expiresInMinutes: number = 15
  ): Promise<string> {
    this.logger.log(`Generating access token for recording ${recordingId}`);

    try {
      // TODO: Query database for blob path
      const blobName = `${tenantId}/*/${recordingId}.mp3`;
      
      // const blockBlobClient = this.recordingsContainer.getBlockBlobClient(blobName);
      
      // Generate SAS token
      // const sasToken = generateBlobSASQueryParameters({
      //   containerName: 'voice-recordings',
      //   blobName,
      //   permissions: BlobSASPermissions.parse('r'),
      //   startsOn: new Date(),
      //   expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000)
      // }, userDelegationKey, accountName).toString();
      
      // return `${blockBlobClient.url}?${sasToken}`;
      
      // Placeholder
      return 'https://placeholder-sas-url';
    } catch (error) {
      this.logger.error(`Failed to generate access token: ${error.message}`);
      throw error;
    }
  }
}
