import { Controller, Post, Get, Delete, Param, HttpCode, HttpStatus, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaHandlingService, MediaProcessingResult, MediaUploadOptions } from './media-handling.service';

@ApiTags('Media Handling')
@Controller('media')
export class MediaHandlingController {
  constructor(private readonly mediaService: MediaHandlingService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and process a media file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        maxSize: { type: 'number', example: 10485760 },
        allowedTypes: {
          type: 'array',
          items: { type: 'string' },
          example: ['image/jpeg', 'image/png'],
        },
        generateThumbnail: { type: 'boolean', example: true },
        expirationDays: { type: 'number', example: 30 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Media file uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        fileId: { type: 'string' },
        url: { type: 'string' },
        thumbnailUrl: { type: 'string' },
        metadata: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Query('maxSize') maxSize?: number,
    @Query('allowedTypes') allowedTypes?: string,
    @Query('generateThumbnail') generateThumbnail?: boolean,
    @Query('expirationDays') expirationDays?: number,
  ) {
    try {
      if (!file) {
        return {
          success: false,
          error: 'No file provided',
        };
      }

      // Parse allowed types
      let parsedAllowedTypes: string[] | undefined;
      if (allowedTypes) {
        parsedAllowedTypes = allowedTypes.split(',');
      }

      // Build options
      const options: MediaUploadOptions = {};
      if (maxSize) options.maxSize = maxSize;
      if (parsedAllowedTypes) options.allowedTypes = parsedAllowedTypes;
      if (generateThumbnail !== undefined) options.generateThumbnail = generateThumbnail;
      if (expirationDays) options.expirationDays = expirationDays;

      const result: MediaProcessingResult = await this.mediaService.uploadMedia(
        file.buffer,
        file.originalname,
        file.mimetype,
        options,
      );

      if (result.success) {
        return {
          success: true,
          fileId: result.fileId,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          metadata: result.metadata,
          message: 'Media file uploaded successfully',
        };
      } else {
        return {
          success: false,
          error: result.error,
          message: 'Failed to upload media file',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to upload media file',
      };
    }
  }

  @Get(':fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a media file by ID' })
  @ApiParam({
    name: 'fileId',
    required: true,
    type: 'string',
    example: 'media-1234567890-abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Media file retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMediaFile(@Param('fileId') fileId: string) {
    try {
      const data = this.mediaService.getMediaFile(fileId);
      
      if (data) {
        return {
          success: true,
          data,
          message: 'Media file retrieved successfully',
        };
      } else {
        return {
          success: false,
          message: 'File not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve media file',
      };
    }
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiParam({
    name: 'fileId',
    required: true,
    type: 'string',
    example: 'media-1234567890-abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Media file deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteMediaFile(@Param('fileId') fileId: string) {
    try {
      const result = this.mediaService.deleteMediaFile(fileId);
      
      if (result) {
        return {
          success: true,
          message: 'Media file deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'File not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete media file',
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all media files' })
  @ApiResponse({
    status: 200,
    description: 'Media files retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllMediaFiles() {
    try {
      const data = this.mediaService.getAllMediaFiles();
      return {
        success: true,
        data,
        message: 'Media files retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve media files',
      };
    }
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up expired media files' })
  @ApiResponse({
    status: 200,
    description: 'Expired media files cleaned up successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async cleanupExpiredFiles() {
    try {
      const data = this.mediaService.cleanupExpiredFiles();
      return {
        success: true,
        data,
        message: `Cleaned up ${data} expired media files`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to clean up expired media files',
      };
    }
  }
}