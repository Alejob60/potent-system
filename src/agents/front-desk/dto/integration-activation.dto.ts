import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class IntegrationActivationDto {
  @IsString()
  sessionId: string;

  @IsString()
  @IsEnum(['google', 'tiktok', 'meta'])
  platform: string;

  @IsString()
  @IsEnum(['create_campaign', 'publish_video', 'schedule_post'])
  action: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
