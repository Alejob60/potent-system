import { StateManagementService } from '../../../state/state-management.service';
import { WebSocketGatewayService } from '../../../websocket/websocket.gateway';
import { DailyCoordinatorService } from '../../daily-coordinator/services/daily-coordinator.service';
import { AgentPostSchedulerService } from '../../agent-post-scheduler/services/agent-post-scheduler.service';
import { MetaMetricsService } from '../../meta-metrics/services/meta-metrics.service';
export declare class TrendAttackCoordinatorService {
    private readonly stateManager;
    private readonly websocketGateway;
    private readonly dailyCoordinator;
    private readonly postScheduler;
    private readonly metaMetrics;
    private readonly logger;
    constructor(stateManager: StateManagementService, websocketGateway: WebSocketGatewayService, dailyCoordinator: DailyCoordinatorService, postScheduler: AgentPostSchedulerService, metaMetrics: MetaMetricsService);
    convocarCampanaViral(campaignData: any): Promise<{
        status: string;
        message: string;
        trend: any;
        taskAssignments: any;
        agentStatus: {
            timestamp: string;
            estados: {
                agente: string;
                estado: string;
                ultimaActividad: string;
            }[];
        };
        schedulingResult: {
            id: string;
            status: string;
            plan: {
                campaignId: string;
                contentTheme: any;
                targetPlatforms: any[];
                scheduledAt: Date;
                metadata: {
                    trendId: any;
                    context: any;
                };
            };
        };
        timestamp: string;
    }>;
    activarPorTrendScanner(trendData: any, context: any): Promise<{
        status: string;
        message: string;
        trend: any;
        taskAssignments: any;
        agentStatus: {
            timestamp: string;
            estados: {
                agente: string;
                estado: string;
                ultimaActividad: string;
            }[];
        };
        schedulingResult: {
            id: string;
            status: string;
            plan: {
                campaignId: string;
                contentTheme: any;
                targetPlatforms: any[];
                scheduledAt: Date;
                metadata: {
                    trendId: any;
                    context: any;
                };
            };
        };
        timestamp: string;
    }>;
    escalarCampana(campaignId: string, sessionId: string): Promise<{
        success: boolean;
        campaignId: string;
        resonanceLevel: number;
        escalationAction: string | null;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        campaignId?: undefined;
        resonanceLevel?: undefined;
        escalationAction?: undefined;
    }>;
    private calcularNivelResonancia;
    private ejecutarEscalamiento;
    private asignarTareas;
    private sincronizarHorarios;
}
