import { ApiProperty } from '@nestjs/swagger';

export class GeneratePaymentLinkDto {
  @ApiProperty({
    description: 'Tenant ID',
    example: 'tenant-123',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Service ID',
    example: 'service-web-dev',
  })
  serviceId: string;
}