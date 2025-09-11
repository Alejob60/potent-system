import {
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';

export class AgentOrchestrationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  agents: string[];

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
