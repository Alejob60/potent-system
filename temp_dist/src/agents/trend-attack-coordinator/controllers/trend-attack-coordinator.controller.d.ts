import { TrendAttackCoordinatorService } from '../services/trend-attack-coordinator.service';
export declare class TrendAttackCoordinatorController {
    private readonly service;
    constructor(service: TrendAttackCoordinatorService);
    convocarCampana(campaignData: any): Promise<{
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
}
