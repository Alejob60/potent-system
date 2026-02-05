import { MediaHandlingService } from './media-handling.service';

describe('MediaHandlingService', () => {
  let service: MediaHandlingService;

  beforeEach(() => {
    service = new MediaHandlingService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadMedia', () => {
    it('should upload a valid media file', async () => {
      const fileBuffer = Buffer.from('test image content');
      const result = await service.uploadMedia(fileBuffer, 'test.jpg', 'image/jpeg');
      
      expect(result.success).toBe(true);
      expect(result.fileId).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.checksum).toBeDefined();
    });

    it('should reject a file that exceeds maximum size', async () => {
      const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB
      const result = await service.uploadMedia(largeBuffer, 'large.jpg', 'image/jpeg', {
        maxSize: 10 * 1024 * 1024, // 10MB
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds maximum allowed size');
    });

    it('should reject a file with unsupported type', async () => {
      const fileBuffer = Buffer.from('test content');
      const result = await service.uploadMedia(fileBuffer, 'test.exe', 'application/exe', {
        allowedTypes: ['image/jpeg', 'image/png'],
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('File type application/exe is not allowed');
    });
  });

  describe('getMediaFile', () => {
    it('should get an existing media file', async () => {
      // First upload a file
      const fileBuffer = Buffer.from('test image content');
      const uploadResult = await service.uploadMedia(fileBuffer, 'test.jpg', 'image/jpeg');
      
      // Then retrieve it
      const retrieved = service.getMediaFile(uploadResult.fileId!);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(uploadResult.fileId);
      expect(retrieved?.name).toBe('test.jpg');
      expect(retrieved?.type).toBe('image/jpeg');
    });

    it('should return null for non-existent file', () => {
      const retrieved = service.getMediaFile('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteMediaFile', () => {
    it('should delete an existing media file', async () => {
      // First upload a file
      const fileBuffer = Buffer.from('test image content');
      const uploadResult = await service.uploadMedia(fileBuffer, 'test.jpg', 'image/jpeg');
      
      // Verify it exists
      expect(service.getMediaFile(uploadResult.fileId!)).toBeDefined();
      
      // Delete it
      const result = service.deleteMediaFile(uploadResult.fileId!);
      
      expect(result).toBe(true);
      
      // Verify it no longer exists
      expect(service.getMediaFile(uploadResult.fileId!)).toBeNull();
    });

    it('should return false for non-existent file', () => {
      const result = service.deleteMediaFile('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('cleanupExpiredFiles', () => {
    it('should clean up expired files', async () => {
      // Upload a file with short expiration
      const fileBuffer = Buffer.from('test image content');
      const uploadResult = await service.uploadMedia(fileBuffer, 'test.jpg', 'image/jpeg', {
        expirationDays: -1, // Already expired
      });
      
      // Verify it exists
      expect(service.getMediaFile(uploadResult.fileId!)).toBeDefined();
      
      // Clean up expired files
      const count = service.cleanupExpiredFiles();
      
      expect(count).toBe(1);
      
      // Verify it no longer exists
      expect(service.getMediaFile(uploadResult.fileId!)).toBeNull();
    });
  });
});