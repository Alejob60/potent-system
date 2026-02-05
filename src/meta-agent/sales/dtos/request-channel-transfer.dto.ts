import { ApiProperty } from '@nestjs/swagger';

export class RequestChannelTransferDto {
  @ApiProperty({
    description: 'Tenant ID',
    example: 'tenant-123',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Channel to transfer to',
    enum: ['whatsapp', 'email'],
    example: 'whatsapp',
  })
  channel: 'whatsapp' | 'email';
}