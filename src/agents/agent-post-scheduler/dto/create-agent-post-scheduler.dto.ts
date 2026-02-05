import { IsString, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAgentPostSchedulerDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
