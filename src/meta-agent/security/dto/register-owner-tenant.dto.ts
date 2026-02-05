import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class RegisterOwnerTenantDto {
  @ApiProperty({
    description: 'Name of the tenant organization',
    example: 'Colombiatic'
  })
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @ApiProperty({
    description: 'Contact email for the tenant',
    example: 'contacto@colombiatic.com'
  })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    description: 'Website URL of the tenant',
    example: 'https://colombiatic.com'
  })
  @IsUrl()
  @IsNotEmpty()
  websiteUrl: string;

  @ApiProperty({
    description: 'Primary business industry of the tenant',
    example: 'Technology'
  })
  @IsString()
  @IsNotEmpty()
  businessIndustry: string;
}