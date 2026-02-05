import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateAgentAnalyticsReportingDto {
  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  reportType: string;

  @IsString()
  @IsOptional()
  dateRange?: string;

  @IsString()
  @IsOptional()
  metrics?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidenceScore?: number;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsString()
  @IsOptional()
  status?: string;
}