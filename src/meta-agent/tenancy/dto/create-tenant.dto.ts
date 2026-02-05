import { IsString, IsOptional, IsEmail, IsUrl, IsArray, IsBoolean, IsEnum } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  tenantId: string;

  @IsString()
  tenantName: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  businessIndustry?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedOrigins?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsString()
  tenantType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}