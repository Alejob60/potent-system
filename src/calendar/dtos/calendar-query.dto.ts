import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { CalendarEvent } from '../calendar.service';

export class CalendarQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum([
    'content_publish',
    'campaign_milestone',
    'review',
    'analysis',
    'meeting',
  ])
  type?: CalendarEvent['type'];

  @IsOptional()
  @IsEnum(['scheduled', 'completed', 'cancelled', 'in_progress'])
  status?: CalendarEvent['status'];

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  campaignId?: string;
}
