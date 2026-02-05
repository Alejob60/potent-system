import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  objective: string;

  @IsArray()
  @IsOptional()
  targetChannels?: string[];

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsArray()
  @IsOptional()
  contentTypes?: string[];

  @IsString()
  @IsOptional()
  tone?: string;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsOptional()
  userId?: string;
}