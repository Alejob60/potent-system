import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAgentFaqResponderDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}