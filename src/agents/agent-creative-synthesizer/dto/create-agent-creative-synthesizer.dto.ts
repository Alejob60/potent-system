import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateAgentCreativeSynthesizerDto {
  @IsString()
  @IsNotEmpty()
  intention: string;

  @IsString()
  @IsNotEmpty()
  emotion: string;

  @IsObject()
  @IsNotEmpty()
  entities: any;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  context?: string;
}