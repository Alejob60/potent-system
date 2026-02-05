import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAgentFaqResponderDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsString()
  @IsOptional()
  audience?: string;

  @IsString()
  @IsOptional()
  detailLevel?: string;

  @IsString()
  @IsOptional()
  format?: string;

  @IsString()
  @IsOptional()
  context?: string;
}
