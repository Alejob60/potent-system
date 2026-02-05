import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BusinessDataDto {
  @ApiProperty({
    description: 'NIT de la empresa',
    example: '123456789-0',
  })
  @IsString()
  @IsNotEmpty()
  nit: string;

  @ApiProperty({
    description: 'Razón social de la empresa',
    example: 'ColombiaTIC S.A.S.',
  })
  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @ApiProperty({
    description: 'Nombre del representante legal',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  representanteLegal: string;

  @ApiProperty({
    description: 'Email de facturación',
    example: 'facturacion@colombiatic.com',
  })
  @IsString()
  @IsNotEmpty()
  emailFacturacion: string;

  @ApiProperty({
    description: 'Teléfono de la empresa',
    example: '+573001234567',
  })
  @IsString()
  @IsNotEmpty()
  telefonoEmpresa: string;
}

export class PaymentInitiateDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID del producto',
    example: 'landing_page',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'ID del plan (opcional)',
    example: 'basic',
    required: false,
  })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({
    description: 'Indica si es una venta rápida',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  fastSale?: boolean;

  @ApiProperty({
    description: 'Datos empresariales (requeridos para montos > COP 2.000.000)',
    type: BusinessDataDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessDataDto)
  business?: BusinessDataDto;
}