import {
  IsString,
  IsObject,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateContentDto {
  @IsString()
  sessionId: string;

  @IsString()
  userId: string;

  @IsString()
  @IsEnum(['generate_video', 'generate_image', 'generate_audio', 'publish'])
  intention: string;

  @IsString()
  emotion: string;

  @IsObject()
  entities: any;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  integrationStatus?: string;
}
