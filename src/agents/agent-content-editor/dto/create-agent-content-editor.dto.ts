import { IsString, IsNotEmpty, IsObject, IsArray, IsOptional } from 'class-validator';

export class CreateAgentContentEditorDto {
  @IsObject()
  @IsNotEmpty()
  content: any;

  @IsArray()
  @IsNotEmpty()
  targetPlatforms: string[];

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