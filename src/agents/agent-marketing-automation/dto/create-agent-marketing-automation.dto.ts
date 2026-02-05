import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateAgentMarketingAutomationDto {
  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  campaignObjective: string;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  timeline?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidenceScore?: number;

  @IsString()
  @IsOptional()
  channels?: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  status?: string;
}