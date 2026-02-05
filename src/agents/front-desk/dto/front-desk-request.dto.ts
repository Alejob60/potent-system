import { IsString, IsOptional, IsObject } from 'class-validator';

export class FrontDeskRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  context?: {
    sessionId?: string;
    language?: string;
    origin?: string; // Add origin information
    siteType?: string; // Add site type information (e.g., 'colombiatic')
    products?: string[]; // Available products/services on the site
    [key: string]: any;
  };

  @IsOptional()
  @IsObject()
  tenantContext?: {
    tenantId: string;
    siteId: string;
    origin: string;
    permissions: string[];
    channel?: string;
    sessionId?: string;
    siteType?: string; // Add site type information
    products?: string[]; // Available products/services for this tenant
    [key: string]: any;
  };
}