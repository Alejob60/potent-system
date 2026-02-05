import { ApiProperty } from '@nestjs/swagger';

export class RegisterOwnerTenantDto {
  @ApiProperty({
    description: 'Tenant name',
    example: 'Colombiatic',
  })
  tenantName: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'contacto@colombiatic.com',
  })
  contactEmail: string;

  @ApiProperty({
    description: 'Website URL',
    example: 'https://colombiatic.com',
  })
  websiteUrl: string;

  @ApiProperty({
    description: 'Business industry',
    example: 'Technology',
  })
  businessIndustry: string;
}