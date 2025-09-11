import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAgentTrendScannerDto {
  @IsString()
  @IsNotEmpty()
  topic: string;
}