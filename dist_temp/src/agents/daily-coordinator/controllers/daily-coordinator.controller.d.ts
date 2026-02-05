import { DailyCoordinatorService } from '../services/daily-coordinator.service';
export declare class DailyCoordinatorController {
    private readonly service;
    constructor(service: DailyCoordinatorService);
    convocarReunion(): Promise<{
        status: string;
        message: string;
        timestamp: string;
    }>;
    consultarEstado(): Promise<{
        timestamp: string;
        estados: {
            agente: string;
            estado: string;
            ultimaActividad: string;
        }[];
    }>;
    publicarResumen(datos: any): Promise<{
        status: string;
        message: string;
        timestamp: string;
    }>;
}
