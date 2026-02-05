import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CalendarEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsEnum([
    'content_publish',
    'campaign_milestone',
    'review',
    'analysis',
    'meeting',
  ])
  type:
    | 'content_publish'
    | 'campaign_milestone'
    | 'review'
    | 'analysis'
    | 'meeting';

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    contentId?: string;
    campaignId?: string;
    channels?: string[];
    contentType?: string;
    assignedAgent?: string;
    [key: string]: any;
  };

  @IsOptional()
  @IsObject()
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };

  @IsOptional()
  @IsArray()
  reminders?: {
    time: number; // minutes before event
    type: 'notification' | 'email' | 'webhook';
  }[];
}

export class ScheduleEventDto {
  @IsObject()
  event: CalendarEventDto;
}
