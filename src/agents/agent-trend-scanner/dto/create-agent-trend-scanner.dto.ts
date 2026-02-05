import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAgentTrendScannerDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  platform?: string;
}
