import { IsString, IsNotEmpty, IsObject, IsEnum } from 'class-validator';
import { ContentEditStatus } from '../entities/content-edit-task.entity';

export class EditingProfile {
  @IsString()
  resolution: string;

  @IsString()
  durationLimit: string;

  @IsString()
  aspectRatio: string;

  @IsString()
  style: string;

  tags: string[];
}

export class EditContentDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  emotion: string;

  @IsString()
  @IsNotEmpty()
  campaignId: string;

  @IsObject()
  @IsNotEmpty()
  editingProfile: EditingProfile;
}