import { ApiProperty } from '@nestjs/swagger';

export class ProcessMessageDto {
  @ApiProperty({
    description: 'Tenant ID',
    example: 'tenant-123',
  })
  tenantId: string;

  @ApiProperty({
    description: 'User message to process',
    example: 'I\'m interested in your web development services',
  })
  message: string;
}