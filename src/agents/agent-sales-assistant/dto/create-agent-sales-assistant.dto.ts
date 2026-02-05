import { IsString, IsOptional, IsEmail, IsInt, Min, Max } from 'class-validator';

export class CreateAgentSalesAssistantDto {
  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  leadInformation: string;

  @IsEmail()
  @IsOptional()
  leadEmail?: string;

  @IsString()
  @IsOptional()
  leadName?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  industry?: string;

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