import { IsString, IsNotEmpty, IsArray, IsOptional, IsUrl, IsEnum } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  contactEmail: string;

  @IsUrl()
  @IsNotEmpty()
  websiteUrl: string;

  @IsString()
  @IsNotEmpty()
  businessIndustry: string;

  @IsArray()
  @IsOptional()
  allowedOrigins?: string[];

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsString()
  @IsOptional()
  tenantId?: string; // If not provided, will be generated

  @IsString()
  @IsOptional()
  siteId?: string; // If not provided, will be generated
}