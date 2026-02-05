import {
  IsString,
  IsArray,
  IsObject,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';

export class ActivateCampaignDto {
  @IsString()
  @IsEnum([
    'product_launch',
    'event_promotion',
    'content_campaign',
    'brand_awareness',
  ])
  campaignType: string;

  @IsString()
  sessionId: string;

  @IsString()
  emotion: string;

  @IsArray()
  @IsString({ each: true })
  platforms: string[];

  @IsNumber()
  @Min(1)
  durationDays: number;

  @IsString()
  objective: string;

  @IsArray()
  @IsString({ each: true })
  agents: string[];

  @IsObject()
  schedule: {
    start: string;
    end: string;
  };

  @IsOptional()
  @IsObject()
  metadata?: any;
}
