import { ApiProperty } from '@nestjs/swagger';

export class ActivateSalesModeDto {
  @ApiProperty({
    description: 'Tenant ID',
    example: 'tenant-123',
  })
  tenantId: string;
}