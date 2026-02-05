import { IsString, IsOptional, IsEmail, IsInt, Min, Max } from 'class-validator';

export class CreateAgentCustomerSupportDto {
  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  customerQuery: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  priority?: string;

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