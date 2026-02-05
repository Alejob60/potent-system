import { IsString, IsNotEmpty, IsObject, IsArray } from 'class-validator';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  features: string[];
}

export class CreateAgentVideoScriptorDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  emotion: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  format: string;

  @IsString()
  @IsNotEmpty()
  objective: string;

  @IsObject()
  product: ProductDto;
}
