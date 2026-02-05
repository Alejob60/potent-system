import { IsString, IsArray, IsOptional } from 'class-validator';

export class PublishContentDto {
  @IsString()
  integrationId: string;

  @IsString()
  assetId: string;

  @IsString()
  caption: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
