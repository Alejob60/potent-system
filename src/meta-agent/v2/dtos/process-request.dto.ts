import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ChannelType {
  WEB = 'web',
  WHATSAPP = 'whatsapp',
  VOICE = 'voice',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram'
}

export enum InputType {
  TEXT = 'text',
  SPEECH = 'speech',
  EVENT = 'event'
}

export class InputDto {
  @ApiProperty({
    enum: InputType,
    description: 'Type of input'
  })
  @IsEnum(InputType)
  @IsNotEmpty()
  type: InputType;

  @ApiPropertyOptional({
    description: 'Text content for text type inputs'
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({
    description: 'URL to speech file for speech type inputs'
  })
  @IsString()
  @IsOptional()
  speechUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the input'
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ProcessRequestDto {
  @ApiProperty({
    description: 'Tenant identifier',
    example: 'tenant-uuid-123'
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({
    description: 'Session identifier',
    example: 'session-uuid-456'
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Correlation identifier for tracing',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID('4')
  @IsNotEmpty()
  correlationId: string;

  @ApiPropertyOptional({
    description: 'User identifier (optional for anonymous sessions)',
    example: 'user-uuid-789'
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    enum: ChannelType,
    description: 'Communication channel'
  })
  @IsEnum(ChannelType)
  @IsNotEmpty()
  channel: ChannelType;

  @ApiProperty({
    type: InputDto,
    description: 'Input data from user'
  })
  @ValidateNested()
  @Type(() => InputDto)
  @IsNotEmpty()
  input: InputDto;

  @ApiPropertyOptional({
    description: 'Context hints for processing'
  })
  @IsObject()
  @IsOptional()
  contextHints?: Record<string, any>;
}
