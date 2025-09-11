import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum AnalyticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class CreateAgentAnalyticsReporterDto {
  @IsString()
  @IsOptional()
  metric?: string;

  @IsEnum(AnalyticsPeriod)
  @IsOptional()
  period?: AnalyticsPeriod;
}
