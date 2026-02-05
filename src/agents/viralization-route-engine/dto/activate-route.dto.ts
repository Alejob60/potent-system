import {
  IsString,
  IsArray,
  IsObject,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class ActivateRouteDto {
  @IsString()
  @IsEnum([
    'product_launch',
    'event_promotion',
    'content_campaign',
    'brand_awareness',
  ])
  routeType: string;

  @IsString()
  sessionId: string;

  @IsString()
  emotion: string;

  @IsArray()
  @IsString({ each: true })
  platforms: string[];

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
