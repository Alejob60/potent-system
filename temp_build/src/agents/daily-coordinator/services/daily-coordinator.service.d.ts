import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { CalendarService } from '../../../calendar/calendar.service';
export declare class DailyCoordinatorService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly calendarService;
    private readonly logger;
    private agentesRegistrados;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, calendarService: CalendarService);
    convocarReunionDiaria(): Promise<{
        status: string;
        message: string;
        timestamp: string;
    }>;
    consultarEstadoAgentes(): Promise<{
        timestamp: string;
        estados: {
            agente: string;
            estado: string;
            ultimaActividad: string;
        }[];
    }>;
    publicarResumenDiario(datos: any): Promise<{
        status: string;
        message: string;
        timestamp: string;
    }>;
    detectarBloqueos(): Promise<{
        status: string;
        message: string;
        blockedAgents: {
            agente: string;
            estado: string;
            ultimaActividad: string;
        }[];
    } | {
        status: string;
        message: string;
        blockedAgents?: undefined;
    }>;
    activarSoporte(bloqueados: any[]): Promise<void>;
    private registrarReunionEnCalendario;
}
