import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateAgentPostSchedulerDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;
}