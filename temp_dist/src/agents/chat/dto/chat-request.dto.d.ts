declare class PreferenciasDto {
    contenido?: string[];
    tono?: string;
    frecuencia?: string;
    language?: string;
}
export declare class ChatRequestDto {
    message: string;
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
export {};
