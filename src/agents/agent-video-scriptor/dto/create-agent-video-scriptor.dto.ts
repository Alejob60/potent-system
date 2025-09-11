import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAgentVideoScriptorDto {
  @IsString()
  @IsNotEmpty()
  topic: string;
}