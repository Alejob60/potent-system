import {
  IsString,
  IsObject,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PreferenciasDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contenido?: string[];

  @IsOptional()
  @IsString()
  tono?: string;

  @IsOptional()
  @IsString()
  frecuencia?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PreferenciasDto)
  @IsOptional()
  context?: {
    sessionId?: string;
    nombre?: string;
    negocio?: string;
    objetivo?: string;
    canales?: string[];
    experiencia?: string;
    ubicacion?: string;
    historial?: string[];
    preferencias?: PreferenciasDto;
    timestamp?: string;
    language?: string;
  };
}
