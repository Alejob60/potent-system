import { Repository } from 'typeorm';
import { ViralizationRoute } from '../entities/viralization-route.entity';
import { ActivateRouteDto } from '../dto/activate-route.dto';
import { HttpService } from '@nestjs/axios';
export declare class ViralizationRouteEngineService {
    private readonly routeRepository;
    private readonly httpService;
    private readonly logger;
    constructor(routeRepository: Repository<ViralizationRoute>, httpService: HttpService);
    activateRoute(activateRouteDto: ActivateRouteDto, userId: string): Promise<any>;
    executeStage(routeId: string, stageOrder: number): Promise<void>;
    getRouteStatus(routeId: string): Promise<any>;
    getAllRoutesBySession(sessionId: string): Promise<ViralizationRoute[]>;
    updateRouteMetrics(routeId: string, metrics: any): Promise<void>;
    private executeTrendScannerStage;
    private executeVideoScriptorStage;
    private executeCreativeSynthesizerStage;
    private executePostSchedulerStage;
    private executeAnalyticsReporterStage;
    private getStageStatus;
    private getRouteStatusForNextStage;
    private addEmotionalNarrative;
    private generateContextualSuggestions;
    private generateSasUrl;
    private notifyFrontDeskRouteCompletion;
}
