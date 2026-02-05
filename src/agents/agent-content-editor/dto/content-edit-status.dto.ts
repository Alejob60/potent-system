import { IsString, IsEnum } from 'class-validator';
import { ContentEditStatus } from '../entities/content-edit-task.entity';

export class ContentEditStatusDto {
  @IsString()
  assetId: string;

  @IsEnum(ContentEditStatus)
  status: ContentEditStatus;

  @IsString()
  message: string;
}